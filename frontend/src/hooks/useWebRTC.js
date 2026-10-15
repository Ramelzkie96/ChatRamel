import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../utils/api";

const FALLBACK_ICE = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
];

function mediaErrorMessage(err) {
  switch (err?.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera or microphone is blocked. Allow access with the lock icon next to the address bar, then try again.";
    case "NotFoundError":
      return "No microphone was found on this device.";
    case "NotReadableError":
    case "AbortError":
      return "Your camera or microphone is being used by another app.";
    default:
      return "Couldn't access your camera or microphone.";
  }
}

// Everything about the browser-to-browser connection lives here.
// The socket only carries signaling; video and audio go directly between the two browsers.
export default function useWebRTC({ socket, onConnected, onFailed }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [, setTick] = useState(0); // re-render when a remote track arrives

  const socketRef = useRef(socket);
  const cbRef = useRef({});
  const pcRef = useRef(null);
  const localRef = useRef(null);
  const callIdRef = useRef(null);
  const isCallerRef = useRef(false);
  const iceServersRef = useRef(FALLBACK_ICE);
  const pendingCandidates = useRef([]); // candidates that arrived before the remote description
  const pendingSignals = useRef([]); // signals that arrived before the connection existed
  const timers = useRef({});

  socketRef.current = socket;
  cbRef.current = { onConnected, onFailed };

  // get STUN (and TURN, when configured) from the server once we're connected
  useEffect(() => {
    if (!socket) return;
    api
      .get("/calls/ice-servers")
      .then((data) => {
        if (Array.isArray(data.iceServers) && data.iceServers.length) {
          iceServersRef.current = data.iceServers;
        }
      })
      .catch(() => {}); // keep the built-in STUN servers
  }, [socket]);

  const send = useCallback((data) => {
    socketRef.current?.emit("call:signal", { callId: callIdRef.current, data });
  }, []);

  /* ---------- camera and microphone ---------- */
  const acquireMedia = useCallback(async (type) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Calls need a secure connection (HTTPS) or localhost.");
      return null;
    }

    const wantsVideo = type === "video";
    const audio = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
    const video = wantsVideo
      ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
      : false;

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio, video });
    } catch (err) {
      if (wantsVideo && (err.name === "NotFoundError" || err.name === "OverconstrainedError")) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio, video: false });
          toast("No camera found. Continuing with audio only.");
        } catch (err2) {
          toast.error(mediaErrorMessage(err2));
          return null;
        }
      } else {
        toast.error(mediaErrorMessage(err));
        return null;
      }
    }

    localRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const setTrackEnabled = useCallback((kind, enabled) => {
    localRef.current
      ?.getTracks()
      .filter((t) => t.kind === kind)
      .forEach((t) => {
        t.enabled = enabled;
      });
  }, []);

  /* ---------- the connection ---------- */
  const dropPeer = useCallback(() => {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};

    const pc = pcRef.current;
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
    }
    pcRef.current = null;
    pendingCandidates.current = [];
    setReconnecting(false);
  }, []);

  // full cleanup: connection AND camera/microphone (this is what turns the camera light off)
  const close = useCallback(() => {
    dropPeer();
    pendingSignals.current = [];
    localRef.current?.getTracks().forEach((t) => t.stop());
    localRef.current = null;
    callIdRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
  }, [dropPeer]);

  useEffect(() => close, [close]);

  const handleSignal = useCallback(
    async (data) => {
      const pc = pcRef.current;
      if (!pc) {
        pendingSignals.current.push(data); // replayed as soon as the connection exists
        return;
      }

      try {
        if (data.description) {
          await pc.setRemoteDescription(data.description);

          for (const candidate of pendingCandidates.current.splice(0)) {
            await pc.addIceCandidate(candidate).catch(() => {});
          }

          if (data.description.type === "offer") {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            send({ description: pc.localDescription.toJSON() });
          }
        } else if (data.candidate) {
          if (pc.remoteDescription) await pc.addIceCandidate(data.candidate).catch(() => {});
          else pendingCandidates.current.push(data.candidate);
        }
      } catch (err) {
        console.warn("Call signaling error:", err.message);
      }
    },
    [send]
  );

  // caller only: ask for a fresh network path when the connection drops
  const restartIce = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || pc.signalingState !== "stable") return;
    try {
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      send({ description: pc.localDescription.toJSON() });
    } catch {
      // the recovery timer below ends the call if this doesn't work out
    }
  }, [send]);

  const startRecovery = useCallback(() => {
    if (timers.current.recover || !pcRef.current) return;

    setReconnecting(true);
    timers.current.recover = setTimeout(() => {
      timers.current.recover = null;
      cbRef.current.onFailed?.();
    }, 15000);

    if (isCallerRef.current) restartIce();
  }, [restartIce]);

  const begin = useCallback(
    async ({ callId, isCaller }) => {
      dropPeer();
      callIdRef.current = callId;
      isCallerRef.current = isCaller;

      try {
        const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
        pcRef.current = pc;

        const remote = new MediaStream();
        setRemoteStream(remote);

        const local = localRef.current;
        local?.getTracks().forEach((t) => pc.addTrack(t, local));

        pc.onicecandidate = (e) => {
          if (e.candidate) send({ candidate: e.candidate.toJSON() });
        };

        pc.ontrack = (e) => {
          remote.addTrack(e.track);
          setTick((n) => n + 1);
        };

        pc.onconnectionstatechange = () => {
          if (pcRef.current !== pc) return;
          const state = pc.connectionState;

          if (state === "connected") {
            clearTimeout(timers.current.connect);
            clearTimeout(timers.current.disconnect);
            clearTimeout(timers.current.recover);
            timers.current.recover = null;
            setReconnecting(false);
            cbRef.current.onConnected?.();
          } else if (state === "disconnected") {
            clearTimeout(timers.current.disconnect);
            timers.current.disconnect = setTimeout(startRecovery, 4000);
          } else if (state === "failed") {
            startRecovery();
          }
        };

        // never connected at all (blocked network, for example)
        timers.current.connect = setTimeout(() => cbRef.current.onFailed?.(), 30000);

        // anything the other side sent while we were still setting up
        for (const data of pendingSignals.current.splice(0)) await handleSignal(data);

        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send({ description: pc.localDescription.toJSON() });
        }
      } catch (err) {
        console.error("Couldn't start the connection:", err);
        cbRef.current.onFailed?.();
      }
    },
    [dropPeer, handleSignal, send, startRecovery]
  );

  return {
    localStream,
    remoteStream,
    reconnecting,
    acquireMedia,
    begin,
    handleSignal,
    setTrackEnabled,
    close,
  };
}