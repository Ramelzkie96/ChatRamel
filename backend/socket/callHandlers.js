import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Call from "../models/Call.js";
import User from "../models/User.js";
import createSystemMessage from "../utils/createSystemMessage.js";
import { getBlockState, otherMemberId } from "../utils/blockHelpers.js";
import { emitToUsers, emitToSocket, emitToUserExcept } from "./emitters.js";
import { isOnline } from "./presence.js";
import { createCall, getCall, getUserCall, removeCall } from "./callState.js";
import createNotification from "../utils/notify.js";

const RING_MS = 30_000;
const TYPES = ["video", "audio"];

const reply = (ack, payload) => {
  if (typeof ack === "function") ack(payload);
};

const label = (type) => (type === "video" ? "video call" : "voice call");
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const clock = (total) => {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
};

const peerSocket = (call, socketId) =>
  socketId === call.callerSocket ? call.calleeSocket : socketId === call.calleeSocket ? call.callerSocket : null;

/* ---------- wrap-up: saves the log and posts the chat line (runs once per call) ---------- */
async function finalize(call, status) {
  if (!removeCall(call.id)) return;

  const endedAt = new Date();
  const duration = call.answeredAt
    ? Math.max(0, Math.round((endedAt - call.answeredAt) / 1000))
    : 0;

  const text = {
    completed: `${call.type === "video" ? "📹" : "📞"} ${capital(label(call.type))} • ${clock(duration)}`,
    missed: `Missed ${label(call.type)}`,
    cancelled: `Missed ${label(call.type)}`,
    declined: `${capital(label(call.type))} declined`,
  }[status];

  try {
    await Call.create({
      chat: call.chatId,
      caller: call.callerId,
      callee: call.calleeId,
      type: call.type,
      status,
      answeredAt: call.answeredAt ?? undefined,
      endedAt,
      duration,
    });

    // "actor" decides who doesn't get an unread badge for the line
    const actor = status === "declined" ? call.calleeId : call.callerId;
    await createSystemMessage(call.chatId, actor, text, [call.callerId, call.calleeId]);

        // the person who was called gets a notification for a call they missed
    if (status === "missed" || status === "cancelled") {
      const caller = await User.findById(call.callerId).select("name").lean();
      await createNotification({
        user: call.calleeId,
        type: "missed_call",
        actor: call.callerId,
        chat: call.chatId,
        text: `Missed ${label(call.type)} from ${caller?.name ?? "someone"}`,
        meta: { callType: call.type },
      });
    }
  } catch (err) {
    console.error("call log error:", err.message);
  }
}

function endActive(call, bySocketId) {
  const duration = call.answeredAt ? Math.round((Date.now() - call.answeredAt) / 1000) : 0;
  emitToSocket(peerSocket(call, bySocketId), "call:ended", { callId: call.id, duration });
  finalize(call, "completed");
}

function cancelRinging(call) {
  emitToUsers([call.calleeId], "call:cancelled", { callId: call.id });
  finalize(call, "cancelled");
}

function declineRinging(call, bySocketId) {
  emitToUserExcept(call.calleeId, bySocketId, "call:handled", { callId: call.id }); // stop ringing in their other tabs
  emitToSocket(call.callerSocket, "call:rejected", { callId: call.id, reason: "declined" });
  finalize(call, "declined");
}

function ringTimeout(callId) {
  const call = getCall(callId);
  if (!call || call.status !== "ringing") return;

  emitToSocket(call.callerSocket, "call:rejected", { callId, reason: "no-answer" });
  emitToUsers([call.calleeId], "call:cancelled", { callId });
  finalize(call, "missed");
}

/* ---------- socket events ---------- */
export default function callHandlers(socket) {
  const me = socket.user.id;

  socket.on("call:invite", async ({ chatId, type } = {}, ack) => {
    try {
      if (!mongoose.isValidObjectId(chatId) || !TYPES.includes(type)) {
        return reply(ack, { ok: false, message: "Invalid call request." });
      }

      const chat = await Chat.findOne({ _id: chatId, members: me }).select("members isGroup").lean();
      if (!chat) return reply(ack, { ok: false, message: "Chat not found." });
      if (chat.isGroup) {
        return reply(ack, { ok: false, message: "Calls are only available in direct chats." });
      }

      const calleeId = otherMemberId(chat, me);
      const { blockedByMe, blockedByThem } = await getBlockState(me, calleeId);
      if (blockedByMe) {
        return reply(ack, { ok: false, message: "You blocked this person. Unblock to call them." });
      }
      if (blockedByThem) {
        return reply(ack, { ok: false, message: "The call couldn't be connected." }); // doesn't reveal the block
      }

      const caller = await User.findById(me).select("name avatar").lean();

      // everything below runs without awaiting, so two invites can't slip past each other
      if (getUserCall(me)) {
        return reply(ack, { ok: false, message: "You're already in a call." });
      }
      if (!isOnline(calleeId)) {
        return reply(ack, { ok: false, message: "They're offline right now." });
      }
      if (getUserCall(calleeId)) {
        return reply(ack, { ok: false, message: "They're on another call." });
      }

      const call = createCall({
        chatId: String(chat._id),
        callerId: me,
        calleeId,
        type,
        callerSocket: socket.id,
      });
      call.timer = setTimeout(() => ringTimeout(call.id), RING_MS);

      emitToUsers([calleeId], "call:incoming", {
        callId: call.id,
        chatId: call.chatId,
        type,
        from: { _id: me, name: caller?.name ?? socket.user.name, avatar: caller?.avatar ?? "" },
      });

      reply(ack, { ok: true, callId: call.id });
    } catch (err) {
      console.error("call invite error:", err.message);
      reply(ack, { ok: false, message: "Couldn't start the call." });
    }
  });

  socket.on("call:accept", ({ callId } = {}, ack) => {
    const call = getCall(callId);
    if (!call || call.status !== "ringing" || call.calleeId !== me) return reply(ack, { ok: false });

    clearTimeout(call.timer);
    call.status = "active";
    call.answeredAt = new Date();
    call.calleeSocket = socket.id;

    emitToUserExcept(me, socket.id, "call:handled", { callId }); // their other tabs stop ringing
    emitToSocket(call.callerSocket, "call:accepted", { callId });
    reply(ack, { ok: true });
  });

  socket.on("call:reject", ({ callId } = {}) => {
    const call = getCall(callId);
    if (!call || call.status !== "ringing" || call.calleeId !== me) return;
    declineRinging(call, socket.id);
  });

  socket.on("call:cancel", ({ callId } = {}) => {
    const call = getCall(callId);
    if (!call || call.status !== "ringing" || call.callerId !== me) return;
    cancelRinging(call);
  });

  socket.on("call:end", ({ callId } = {}) => {
    const call = getCall(callId);
    if (!call || (call.callerId !== me && call.calleeId !== me)) return;

    if (call.status === "ringing") {
      return me === call.callerId ? cancelRinging(call) : declineRinging(call, socket.id);
    }
    if (peerSocket(call, socket.id) !== undefined && [call.callerSocket, call.calleeSocket].includes(socket.id)) {
      endActive(call, socket.id);
    }
  });

  // offers, answers and network candidates: passed straight to the other browser
  socket.on("call:signal", ({ callId, data } = {}) => {
    const call = getCall(callId);
    if (!call || call.status !== "active" || !data || typeof data !== "object") return;
    if (JSON.stringify(data).length > 20_000) return;

    emitToSocket(peerSocket(call, socket.id), "call:signal", { callId, data });
  });

  // "Jessa muted" / "camera off"
  socket.on("call:media", ({ callId, audio, video } = {}) => {
    const call = getCall(callId);
    if (!call || call.status !== "active") return;

    emitToSocket(peerSocket(call, socket.id), "call:media", {
      callId,
      audio: Boolean(audio),
      video: Boolean(video),
    });
  });
}

// called when a connection drops, so nobody is left in a call with a ghost
export function cleanupSocketCalls(socket, wentOffline) {
  const me = socket.user.id;
  const call = getUserCall(me);
  if (!call) return;

  if (call.status === "ringing") {
    if (me === call.callerId && socket.id === call.callerSocket) {
      cancelRinging(call);
    } else if (me === call.calleeId && wentOffline) {
      // the callee's last tab closed while it was ringing
      emitToSocket(call.callerSocket, "call:rejected", { callId: call.id, reason: "unavailable" });
      finalize(call, "missed");
    }
    return;
  }

  if (call.status === "active" && [call.callerSocket, call.calleeSocket].includes(socket.id)) {
    endActive(call, socket.id);
  }
}