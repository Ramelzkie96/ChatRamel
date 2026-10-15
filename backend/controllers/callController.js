import Call from "../models/Call.js";
import asyncHandler from "../utils/asyncHandler.js";
import getChatForMember from "../utils/getChatForMember.js";
import { getClearedAt } from "../utils/clearHelpers.js";

// GET /api/calls/ice-servers  → STUN always, TURN only when the three .env keys are set
export const getIceServers = asyncHandler(async (req, res) => {
  const iceServers = [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ];

  const urls = (process.env.TURN_URLS || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  if (urls.length && process.env.TURN_USERNAME && process.env.TURN_CREDENTIAL) {
    iceServers.push({
      urls,
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL,
    });
  }

  res.json({ iceServers });
});

// GET /api/calls/:chatId  → recent calls in this chat (for a future call-history screen)
export const getCallHistory = asyncHandler(async (req, res) => {
  const chat = await getChatForMember(req.params.chatId, req.user._id, res);

  const filter = { chat: chat._id };
  const cleared = getClearedAt(chat, req.user._id);
  if (cleared) filter.createdAt = { $gt: cleared };

  const calls = await Call.find(filter)
    .sort({ createdAt: -1 })
    .limit(30)
    .select("caller callee type status duration createdAt");

  res.json(calls);
});