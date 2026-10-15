import Message from "../models/Message.js";
import asyncHandler from "../utils/asyncHandler.js";
import getChatForMember from "../utils/getChatForMember.js";
import { getClearedAt } from "../utils/clearHelpers.js";

// GET /api/chats/:chatId/media?type=images|files&limit=30&before=<ISO date>
export const getChatMedia = asyncHandler(async (req, res) => {
  const chat = await getChatForMember(req.params.chatId, req.user._id, res);

  const { type } = req.query;
  if (type !== "images" && type !== "files") {
    res.status(400);
    throw new Error('type must be "images" or "files".');
  }

  const limit = Math.min(Number(req.query.limit) || 30, 60);
  const filter = { chat: chat._id };

  if (type === "images") filter.image = { $exists: true, $ne: "" };
  else filter["file.url"] = { $exists: true, $ne: "" };

  // nothing from before I cleared this chat, and optional paging with ?before=
  const range = {};
  const cleared = getClearedAt(chat, req.user._id);
  if (cleared) range.$gt = cleared;

  if (req.query.before) {
    const before = new Date(req.query.before);
    if (Number.isNaN(before.getTime())) {
      res.status(400);
      throw new Error("Invalid date.");
    }
    range.$lt = before;
  }
  if (Object.keys(range).length > 0) filter.createdAt = range;

  const items = await Message.find(filter)
    .sort({ createdAt: -1 }) // newest first
    .limit(limit)
    .select("image file text createdAt sender")
    .populate("sender", "name");

  res.json(items);
});