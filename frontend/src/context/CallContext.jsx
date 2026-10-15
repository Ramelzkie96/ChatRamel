import { createContext, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useSocket from "../hooks/useSocket";
import useWebRTC from "../hooks/useWebRTC";
import { startRing, stopRing } from "../utils/ringtone";
import { getAlertSettings } from "../utils/alertSettings";
import { formatDuration } from "../utils/formatDuration";

export const CallContext = createContext(null);

const REJECT_MESSAGES = {
  declined: (n) => `${n} declined the call.`,
  busy: (n) => `${n} is on another call.`,
  unavailable: (n) => `${n} is unavailable right now.`,
  "no-answer": (n) => `${n} didn't answer.`,
};

export function CallProvider({ children }) {
  const socket = useSocket();

  // call: null, or { callId, chatId, type, direction, status, connectedAt, peer }
  // direction: "outgoing" | "incoming"
  // status: "calling" | "ringing" | "connecting" | "connected"
  const [call, setCall] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [peerMedia, setPeerMedia] = useState({ audio: true, video: true });

  const callRef = useRef(null); // always the latest call, for socket handlers
  const mediaRef = useRef({ audio: true, video: true });
  const startingRef = useRef(false);
  const notifRef = useRef(null);
  const handlers = useRef({});

  const {
    localStream,
    remoteStream,
    reconnecting,
    acquireMedia,
    begin,
    handleSignal,
    setTrackEnabled,
    close: closePeer,
  } = useWebRTC({
    socket,
    onConnected: () => handlers.current.connected?.(),
    onFailed: () => handlers.current.failed?.(),
  });

  const updateCall = useCallback((next) => {
    callRef.current = next;
    setCall(next);
  }, []);

  const patchCall = useCallback(
    (patch) => {
      if (callRef.current) updateCall({ ...callRef.current, ...patch });
    },
    [updateCall]
  );

  // back to idle: stops the ringtone, the camera, the microphone and the connection
  const reset = useCallback(() => {
    stopRing();
    notifRef.current?.close?.();
    notifRef.current = null;
    closePeer();

    callRef.current = null;
    setCall(null);
    mediaRef.current = { audio: true, video: true };
    setMicOn(true);
    setCamOn(true);
    setPeerMedia({ audio: true, video: true });
    startingRef.current = false;
  }, [closePeer]);

  useEffect(() => () => stopRing(), []);

  const emitMedia = useCallback(() => {
    const c = callRef.current;
    if (c && socket) socket.emit("call:media", { callId: c.callId, ...mediaRef.current });
  }, [socket]);

  /* ---------- actions ---------- */
  const startCall = useCallback(
    async (chat, type) => {
      if (!socket?.connected) return toast.error("You're offline. Please wait while we reconnect.");
      if (callRef.current || startingRef.current) return toast("You're already in a call.");
      if (chat.isGroup) return toast("Calls are only available in direct chats.");
      if (chat.blockedByMe) return toast.error("Unblock this person to call them.");
      if (!chat.other) return;

      startingRef.current = true;

      // ask for the camera and microphone first, so a blocked permission never rings the other person
      const stream = await acquireMedia(type);
      if (!stream) {
        startingRef.current = false;
        return;
      }
      const hasVideo = stream.getVideoTracks().length > 0;

      socket.timeout(8000).emit("call:invite", { chatId: chat.id, type }, (err, res) => {
        startingRef.current = false;

        if (err || !res?.ok) {
          closePeer();
          toast.error(
            err ? "The server didn't respond. Please try again." : res?.message || "Couldn't start the call."
          );
          return;
        }

        mediaRef.current = { audio: true, video: hasVideo };
        setMicOn(true);
        setCamOn(hasVideo);
        setPeerMedia({ audio: true, video: type === "video" });

        updateCall({
          callId: res.callId,
          chatId: chat.id,
          type,
          direction: "outgoing",
          status: "calling",
          connectedAt: null,
          peer: { id: chat.other._id, name: chat.name, avatar: chat.avatar },
        });
        startRing("outgoing");
      });
    },
    [socket, acquireMedia, closePeer, updateCall]
  );

  const acceptCall = useCallback(async () => {
    const c = callRef.current;
    if (!c || c.direction !== "incoming" || c.status !== "ringing" || startingRef.current) return;

    startingRef.current = true;
    stopRing();

    const stream = await acquireMedia(c.type);

    // the caller may have hung up while the permission prompt was open
    if (callRef.current?.callId !== c.callId) {
      closePeer();
      return;
    }

    if (!stream) {
      socket?.emit("call:reject", { callId: c.callId });
      reset();
      return;
    }

    const hasVideo = stream.getVideoTracks().length > 0;
    mediaRef.current = { audio: true, video: hasVideo };
    setMicOn(true);
    setCamOn(hasVideo);
    patchCall({ status: "connecting" });

    // the connection is ready before we say "accepted", so the offer can't arrive too early
    await begin({ callId: c.callId, isCaller: false });

    socket?.timeout(8000).emit("call:accept", { callId: c.callId }, (err, res) => {
      startingRef.current = false;
      if (err || !res?.ok) {
        toast("That call has already ended.");
        reset();
      }
    });
  }, [socket, acquireMedia, closePeer, begin, patchCall, reset]);

  // works for cancelling, declining and ending
  const hangUp = useCallback(() => {
    const c = callRef.current;
    if (!c) return;

    if (c.direction === "outgoing" && c.status === "calling") {
      socket?.emit("call:cancel", { callId: c.callId });
    } else if (c.direction === "incoming" && c.status === "ringing") {
      socket?.emit("call:reject", { callId: c.callId });
    } else {
      socket?.emit("call:end", { callId: c.callId });
    }
    reset();
  }, [socket, reset]);

  const toggleMic = useCallback(() => {
    const next = !mediaRef.current.audio;
    mediaRef.current.audio = next;
    setMicOn(next);
    setTrackEnabled("audio", next);
    emitMedia();
  }, [setTrackEnabled, emitMedia]);

  const toggleCam = useCallback(() => {
    if (!localStream?.getVideoTracks().length) return;
    const next = !mediaRef.current.video;
    mediaRef.current.video = next;
    setCamOn(next);
    setTrackEnabled("video", next);
    emitMedia();
  }, [localStream, setTrackEnabled, emitMedia]);

  // always the latest versions, called by the connection hook
  useEffect(() => {
    handlers.current = {
      connected: () => {
        const c = callRef.current;
        if (!c) return;
        if (c.status !== "connected") updateCall({ ...c, status: "connected", connectedAt: Date.now() });
        emitMedia(); // tell them whether my mic and camera are on
      },
      failed: () => {
        const c = callRef.current;
        if (!c) return;
        toast.error(
          c.status === "connected"
            ? "Connection lost."
            : "Couldn't connect the call. Your network may be blocking direct calls."
        );
        hangUp();
      },
    };
  });

  /* ---------- socket events ---------- */
  useEffect(() => {
    if (!socket) return;

    const current = (id) => (callRef.current?.callId === id ? callRef.current : null);

    const onIncoming = ({ callId, chatId, type, from }) => {
      if (callRef.current) {
        socket.emit("call:reject", { callId }); // already busy (the server normally prevents this)
        return;
      }

      setPeerMedia({ audio: true, video: type === "video" });
      updateCall({
        callId,
        chatId,
        type,
        direction: "incoming",
        status: "ringing",
        connectedAt: null,
        peer: { id: from._id, name: from.name, avatar: from.avatar },
      });
      startRing("incoming");

      // a desktop alert when ChatRamel is in the background
      const settings = getAlertSettings();
      const tabActive = document.visibilityState === "visible" && document.hasFocus();
      if (
        settings.desktop &&
        !tabActive &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          const n = new Notification(`${from.name} is calling`, {
            body: type === "video" ? "Incoming video call" : "Incoming voice call",
            tag: `call-${callId}`,
            requireInteraction: true,
            silent: true,
          });
          n.onclick = () => {
            window.focus();
            n.close();
          };
          notifRef.current = n;
        } catch {
          // the ringtone and the in-app screen still work
        }
      }
    };

    const onAccepted = ({ callId }) => {
      if (!current(callId)) return;
      stopRing();
      patchCall({ status: "connecting" });
      begin({ callId, isCaller: true });
    };

    const onRejected = ({ callId, reason }) => {
      const c = current(callId);
      if (!c) return;
      const message = (REJECT_MESSAGES[reason] ?? REJECT_MESSAGES.unavailable)(c.peer.name);
      toast(message);
      reset();
    };

    const onCancelled = ({ callId }) => {
      const c = current(callId);
      if (!c) return;
      toast(`Missed call from ${c.peer.name}`);
      reset();
    };

    const onEnded = ({ callId, duration }) => {
      if (!current(callId)) return;
      toast(duration ? `Call ended • ${formatDuration(duration)}` : "Call ended");
      reset();
    };

    // another tab of mine answered or declined, so stop ringing here
    const onHandled = ({ callId }) => {
      const c = current(callId);
      if (c && c.direction === "incoming" && c.status === "ringing") reset();
    };

    const onSignal = ({ callId, data }) => {
      if (current(callId)) handleSignal(data);
    };

    const onMedia = ({ callId, audio, video }) => {
      if (current(callId)) setPeerMedia({ audio, video });
    };

    // the server ends the call when my connection drops, so mirror that here
    const onDisconnect = () => {
      if (!callRef.current) return;
      toast.error("Connection lost.");
      reset();
    };

    socket.on("call:incoming", onIncoming);
    socket.on("call:accepted", onAccepted);
    socket.on("call:rejected", onRejected);
    socket.on("call:cancelled", onCancelled);
    socket.on("call:ended", onEnded);
    socket.on("call:handled", onHandled);
    socket.on("call:signal", onSignal);
    socket.on("call:media", onMedia);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:accepted", onAccepted);
      socket.off("call:rejected", onRejected);
      socket.off("call:cancelled", onCancelled);
      socket.off("call:ended", onEnded);
      socket.off("call:handled", onHandled);
      socket.off("call:signal", onSignal);
      socket.off("call:media", onMedia);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket, begin, handleSignal, patchCall, reset, updateCall]);

  const value = {
    call,
    inCall: Boolean(call),
    localStream,
    remoteStream,
    reconnecting,
    micOn,
    camOn,
    canToggleCamera: Boolean(localStream?.getVideoTracks().length),
    peerMedia,
    startCall,
    acceptCall,
    hangUp,
    toggleMic,
    toggleCam,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}