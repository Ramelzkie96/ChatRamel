import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import getChatForMember from "../utils/getChatForMember.js";
import populateChat from "../utils/populateChat.js";
import presentChat from "../utils/presentChat.js";
import { getClearedAt } from "../utils/clearHelpers.js";
import { getBlockedSet, getBlockState } from "../utils/blockHelpers.js";
import { emitNewChat, emitChatCleared } from "../socket/emitters.js";
import { CATEGORY_IDS } from "../utils/groupCategories.js";
import createNotification from "../utils/notify.js";

// GET /api/chats  → everything for the sidebar, with unread counts and block state
export const getMyChats = asyncHandler(async (req, res) => {
  const chats = await populateChat(
    Chat.find({ members: req.user._id }).sort({ updatedAt: -1 })
  );
  const blockedSet = await getBlockedSet(req.user._id);

  // messages from other people that I haven't seen yet (ignoring anything before I cleared the chat)
  const unreadMap = new Map();
  if (chats.length > 0) {
    const rows = await Message.aggregate([
      {
        $match: {
          sender: { $ne: req.user._id },
          seenBy: { $ne: req.user._id },
          $or: chats.map((c) => {
            const cleared = getClearedAt(c, req.user._id);
            return cleared ? { chat: c._id, createdAt: { $gt: cleared } } : { chat: c._id };
          }),
        },
      },
      { $group: { _id: "$chat", count: { $sum: 1 } } },
    ]);
    rows.forEach((r) => unreadMap.set(String(r._id), r.count));
  }

  res.json(
    chats.map((c) =>
      presentChat(c, req.user._id, { blockedSet, unread: unreadMap.get(String(c._id)) || 0 })
    )
  );
});

// GET /api/chats/:chatId  → one chat (for the info panel)
export const getChat = asyncHandler(async (req, res) => {
  await getChatForMember(req.params.chatId, req.user._id, res);
  const chat = await populateChat(Chat.findById(req.params.chatId));
  const blockedSet = await getBlockedSet(req.user._id);
  res.json(presentChat(chat, req.user._id, { blockedSet }));
});

// POST /api/chats  { userId }  → open the DM if it exists, otherwise create it
export const createOrOpenDM = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    res.status(400);
    throw new Error("A valid userId is required.");
  }
  if (req.user._id.equals(userId)) {
    res.status(400);
    throw new Error("You can't start a chat with yourself.");
  }

  const other = await User.findById(userId);
  if (!other) {
    res.status(404);
    throw new Error("User not found.");
  }

  let chat = await Chat.findOne({
    isGroup: false,
    members: { $all: [req.user._id, other._id], $size: 2 },
  });

  let created = false;
  if (!chat) {
    chat = await Chat.create({ isGroup: false, members: [req.user._id, other._id] });
    created = true;
  }

  const populated = await populateChat(Chat.findById(chat._id));

  // someone who blocked you doesn't get a new chat popping up in their sidebar
  if (created) {
    const { blockedByThem } = await getBlockState(req.user._id, other._id);
    if (!blockedByThem) emitNewChat(populated, req.user._id);
  }

  const blockedSet = await getBlockedSet(req.user._id);
  res.status(created ? 201 : 200).json(presentChat(populated, req.user._id, { blockedSet }));
});


// POST /api/chats/group  { name, category, members: [ids], description? }
export const createGroup = asyncHandler(async (req, res) => {
  const { name, category, description = "", members = [] } = req.body;

  if (!name?.trim()) {
    res.status(400);
    throw new Error("Group name is required.");
  }
  if (!CATEGORY_IDS.includes(category)) {
    res.status(400);
    throw new Error("Choose a category: work, school or friends.");
  }
  if (!Array.isArray(members) || members.length < 1) {
    res.status(400);
    throw new Error("Add at least one member to the group.");
  }
  if (!members.every((id) => mongoose.isValidObjectId(id))) {
    res.status(400);
    throw new Error("One or more member ids are invalid.");
  }

  // remove duplicates and make sure the creator is included
  const memberIds = [...new Set([req.user._id.toString(), ...members.map(String)])];

  const found = await User.countDocuments({ _id: { $in: memberIds } });
  if (found !== memberIds.length) {
    res.status(404);
    throw new Error("One or more users were not found.");
  }

  const chat = await Chat.create({
    isGroup: true,
    name: name.trim(),
    category,
    description: description.trim(),
    members: memberIds,
    admins: [req.user._id],
  });

  const populated = await populateChat(Chat.findById(chat._id));

  emitNewChat(populated, req.user._id);
    await Promise.all(
    memberIds
      .filter((id) => id !== req.user._id.toString())
      .map((id) =>
        createNotification({
          user: id,
          type: "group_added",
          actor: req.user._id,
          chat: chat._id,
          text: `${req.user.name} added you to ${chat.name}`,
        })
      )
  );

  res.status(201).json(populated);
});

// POST /api/chats/:chatId/clear  → hides the history for ME only (the other person keeps theirs)
export const clearChat = asyncHandler(async (req, res) => {
  const chat = await getChatForMember(req.params.chatId, req.user._id, res);

  if (chat.isGroup) {
    res.status(400);
    throw new Error("Clear chat is only available in direct chats.");
  }

  const at = new Date();

  // update my entry if it exists, otherwise add one
  const updated = await Chat.updateOne(
    { _id: chat._id, "clearedAt.user": req.user._id },
    { $set: { "clearedAt.$.at": at } }
  );
  if (updated.matchedCount === 0) {
    await Chat.updateOne({ _id: chat._id }, { $push: { clearedAt: { user: req.user._id, at } } });
  }

  emitChatCleared(req.user._id, chat._id, at.toISOString()); // my tabs only

  res.json({ chatId: chat._id, clearedAt: at });
});