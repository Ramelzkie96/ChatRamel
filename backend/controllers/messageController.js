import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import asyncHandler from "../utils/asyncHandler.js";
import getChatForMember from "../utils/getChatForMember.js";
import cleanFilename from "../utils/cleanFilename.js";
import { getClearedAt } from "../utils/clearHelpers.js";
import { assertCanMessage } from "../utils/blockHelpers.js";
import { UPLOAD_ROOT } from "../middleware/uploadMiddleware.js";
import { emitNewMessage, emitReaction } from "../socket/emitters.js";
import isSingleEmoji from "../utils/isSingleEmoji.js";

const removeFile = (filePath) => {
  if (filePath) fs.promises.unlink(filePath).catch(() => {});
};

// saves a message, makes it the chat's lastMessage and pushes it live
const saveAndEmit = async (chat, data) => {
  const message = await Message.create({ chat: chat._id, seenBy: [data.sender], ...data });
  await Chat.findByIdAndUpdate(chat._id, { lastMessage: message._id });

  const populated = await message.populate("sender", "name avatar");
  emitNewMessage(chat.members, populated);
  return populated;
};

// GET /api/messages/:chatId?limit=50&before=2026-10-05T08:00:00.000Z
export const getMessages = asyncHandler(async (req, res) => {
  const chat = await getChatForMember(req.params.chatId, req.user._id, res);

  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const filter = { chat: chat._id };

  // never show anything from before I cleared this chat
  const range = {};
  const cleared = getClearedAt(chat, req.user._id);
  if (cleared) range.$gt = cleared;
  if (req.query.before) range.$lt = new Date(req.query.before);
  if (Object.keys(range).length > 0) filter.createdAt = range;

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 }) // newest first so we can page backwards
    .limit(limit)
    .populate("sender", "name avatar")
    .populate("reactions.user", "name avatar");

  // send oldest → newest so the UI can render top to bottom
  res.json(messages.reverse());
});

// POST /api/messages/:chatId  { text }
export const sendMessage = asyncHandler(async (req, res) => {
  const chat = await getChatForMember(req.params.chatId, req.user._id, res);
  await assertCanMessage(chat, req.user._id, res);

  const text = (req.body.text || "").trim();
  if (!text) {
    res.status(400);
    throw new Error("Message can't be empty.");
  }
  if (text.length > 2000) {
    res.status(400);
    throw new Error("Message is too long (2000 characters max).");
  }

  const populated = await saveAndEmit(chat, { sender: req.user._id, text });
  res.status(201).json(populated);
});

// shared checks for the two upload routes; deletes the saved file if anything fails
const prepareUpload = async (req, res, what) => {
  try {
    const chat = await getChatForMember(req.params.chatId, req.user._id, res);
    await assertCanMessage(chat, req.user._id, res);

    if (!req.file) {
      res.status(400);
      throw new Error(`Please choose ${what}.`);
    }

    const caption = (req.body.text || "").trim();
    if (caption.length > 2000) {
      res.status(400);
      throw new Error("Caption is too long (2000 characters max).");
    }

    return { chat, caption };
  } catch (err) {
    removeFile(req.file?.path);
    throw err;
  }
};

// POST /api/messages/:chatId/image  (multipart: "image" + optional "text" caption)
export const sendImageMessage = asyncHandler(async (req, res) => {
  const { chat, caption } = await prepareUpload(req, res, "an image");

  const populated = await saveAndEmit(chat, {
    sender: req.user._id,
    text: caption,
    image: `/uploads/messages/${req.file.filename}`,
  });

  res.status(201).json(populated);
});

// POST /api/messages/:chatId/file  (multipart: "file" + optional "text" caption)
export const sendFileMessage = asyncHandler(async (req, res) => {
  const { chat, caption } = await prepareUpload(req, res, "a file");

  const populated = await saveAndEmit(chat, {
    sender: req.user._id,
    text: caption,
    file: {
      url: `/uploads/files/${req.file.filename}`,
      name: cleanFilename(req.file.originalname),
      size: req.file.size,
      mimeType: req.file.mimetype,
    },
  });

  res.status(201).json(populated);
});

// GET /api/messages/:chatId/files/:messageId  → downloads a document (members only)
export const downloadFile = asyncHandler(async (req, res) => {
  const chat = await getChatForMember(req.params.chatId, req.user._id, res);

  if (!mongoose.isValidObjectId(req.params.messageId)) {
    res.status(400);
    throw new Error("Invalid message id.");
  }

  const message = await Message.findOne({ _id: req.params.messageId, chat: chat._id });
  const cleared = getClearedAt(chat, req.user._id);

  // a file from before I cleared the chat is gone for me
  if (!message?.file?.url || (cleared && message.createdAt <= cleared)) {
    res.status(404);
    throw new Error("File not found.");
  }

  // basename() keeps the path inside the files folder, whatever is stored
  const filePath = path.join(UPLOAD_ROOT, "files", path.basename(message.file.url));

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.download(filePath, message.file.name, (err) => {
    if (err && !res.headersSent) res.status(404).json({ message: "File not found." });
  });
});

// PUT /api/messages/:chatId/:messageId/reaction  { emoji: "👍" }  or  { emoji: null } to remove mine
export const setReaction = asyncHandler(async (req, res) => {
  const chat = await getChatForMember(req.params.chatId, req.user._id, res);
  await assertCanMessage(chat, req.user._id, res); // same block rules as sending

  const { messageId } = req.params;
  if (!mongoose.isValidObjectId(messageId)) {
    res.status(400);
    throw new Error("Invalid message id.");
  }

  const { emoji } = req.body;
  if (emoji === undefined) {
    res.status(400);
    throw new Error("Send an emoji, or null to remove your reaction.");
  }
  if (emoji !== null && !isSingleEmoji(emoji)) {
    res.status(400);
    throw new Error("Choose a single emoji.");
  }

  const message = await Message.findOne({ _id: messageId, chat: chat._id }).select("type createdAt");
  const cleared = getClearedAt(chat, req.user._id);

  // a message from before I cleared the chat is gone for me
  if (!message || (cleared && message.createdAt <= cleared)) {
    res.status(404);
    throw new Error("Message not found.");
  }
  if (message.type === "system") {
    res.status(400);
    throw new Error("You can't react to this message.");
  }

  const me = req.user._id;

  if (emoji === null) {
    await Message.updateOne({ _id: message._id }, { $pull: { reactions: { user: me } } });
  } else {
    // Each step is one atomic update on one document, so two quick taps can never
    // leave a person with two reactions. The loop covers the rare case where another
    // request changes things between the two steps.
    for (let attempt = 0; attempt < 3; attempt++) {
      const replaced = await Message.updateOne(
        { _id: message._id, "reactions.user": me },
        { $set: { "reactions.$.emoji": emoji } }
      );
      if (replaced.matchedCount > 0) break;

      const added = await Message.updateOne(
        { _id: message._id, "reactions.user": { $ne: me } },
        { $push: { reactions: { user: me, emoji } } }
      );
      if (added.matchedCount > 0) break;
    }
  }

  const updated = await Message.findById(message._id)
    .select("reactions")
    .populate("reactions.user", "name avatar");
  const reactions = updated?.reactions ?? [];

  emitReaction(chat.members, {
    chatId: String(chat._id),
    messageId: String(message._id),
    reactions,
  });

  res.json({ reactions });
});