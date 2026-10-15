import crypto from "crypto";

// Live calls live in memory only (they don't survive a server restart, which is fine:
// a restart drops every socket anyway).
const calls = new Map(); // callId -> call
const userCalls = new Map(); // userId -> callId (a user can be in only one call at a time)

export function createCall({ chatId, callerId, calleeId, type, callerSocket }) {
  const call = {
    id: crypto.randomUUID(),
    chatId,
    callerId,
    calleeId,
    type,
    callerSocket, // the one tab that is calling
    calleeSocket: null, // set when the callee accepts in one of their tabs
    status: "ringing", // "ringing" | "active"
    createdAt: new Date(),
    answeredAt: null,
    timer: null,
  };

  calls.set(call.id, call);
  userCalls.set(callerId, call.id);
  userCalls.set(calleeId, call.id);
  return call;
}

export const getCall = (id) => calls.get(id) ?? null;

export function getUserCall(userId) {
  const id = userCalls.get(String(userId));
  return id ? getCall(id) : null;
}

// returns the call the first time, null after that (so a call is only wrapped up once)
export function removeCall(id) {
  const call = calls.get(id);
  if (!call) return null;

  clearTimeout(call.timer);
  calls.delete(id);
  [call.callerId, call.calleeId].forEach((uid) => {
    if (userCalls.get(uid) === id) userCalls.delete(uid);
  });
  return call;
}