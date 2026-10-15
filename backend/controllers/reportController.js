import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import getChatForMember from "../utils/getChatForMember.js";
import { getClearedAt } from "../utils/clearHelpers.js";
import { emitBlockUpdate } from "../socket/emitters.js";

const REASONS = ["spam", "harassment", "inappropriate", "impersonation", "other"];
const EVIDENCE_COUNT = 10;
const DAY = 24 * 60 * 60 * 1000;

// POST /api/reports  { userId, chatId?, reason, details?, alsoBlock? }
export const createReport = asyncHandler(async (req, res) => {
  const { userId, chatId, reason, alsoBlock } = req.body;
  const details = typeof req.body.details === "string" ? req.body.details.trim() : "";

  if (!mongoose.isValidObjectId(userId)) {
    res.status(400);
    throw new Error("A valid userId is required.");
  }
  if (req.user._id.equals(userId)) {
    res.status(400);
    throw new Error("You can't report yourself.");
  }
  if (!REASONS.includes(reason)) {
    res.status(400);
    throw new Error("Please choose a reason.");
  }
  if (details.length > 500) {
    res.status(400);
    throw new Error("Details are too long (500 characters max).");
  }

  const target = await User.findById(userId).select("name");
  if (!target) {
    res.status(404);
    throw new Error("User not found.");
  }

  // you can only report someone you share a chat with
  let chat;
  if (chatId) {
    chat = await getChatForMember(chatId, req.user._id, res);
    if (!chat.members.some((m) => m.equals(userId))) {
      res.status(400);
      throw new Error("That person is not in this chat.");
    }
  } else {
    chat = await Chat.findOne({ members: { $all: [req.user._id, userId] } });
    if (!chat) {
      res.status(403);
      throw new Error("You can only report people you share a chat with.");
    }
  }

  // one report per person every 24 hours
  const recent = await Report.findOne({
    reporter: req.user._id,
    reported: userId,
    createdAt: { $gte: new Date(Date.now() - DAY) },
  }).select("_id");

  if (recent) {
    res.status(409);
    throw new Error("You already reported this person recently. We'll review it.");
  }

  // evidence = the last messages this reporter can see (nothing from before their own "clear")
  const filter = { chat: chat._id, type: { $ne: "system" } };
  const cleared = getClearedAt(chat, req.user._id);
  if (cleared) filter.createdAt = { $gt: cleared };

  const recentMessages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(EVIDENCE_COUNT)
    .populate("sender", "name");

  const evidence = recentMessages.reverse().map((m) => ({
    sender: m.sender?._id,
    senderName: m.sender?.name ?? "",
    text: m.text,
    hasImage: Boolean(m.image),
    hasFile: Boolean(m.file?.url),
    fileName: m.file?.name ?? "",
    sentAt: m.createdAt,
  }));

  await Report.create({
    reporter: req.user._id,
    reported: target._id,
    chat: chat._id,
    reason,
    details,
    evidence,
  });

  const block = alsoBlock === true;
  if (block) {
    await User.updateOne({ _id: req.user._id }, { $addToSet: { blockedUsers: target._id } });
    emitBlockUpdate(req.user._id, target._id, true);
  }

  res.status(201).json({ message: "Report submitted.", blocked: block });
});