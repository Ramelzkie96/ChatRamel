import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import getChatForMember from "../utils/getChatForMember.js";
import populateChat from "../utils/populateChat.js";
import createSystemMessage from "../utils/createSystemMessage.js";
import { UPLOAD_ROOT } from "../middleware/uploadMiddleware.js";
import { CATEGORY_IDS, CATEGORY_LABELS } from "../utils/groupCategories.js";
import createNotification from "../utils/notify.js";
import {
  emitChatUpdated,
  emitChatNewTo,
  emitChatRemoved,
} from "../socket/emitters.js";

const MAX_MEMBERS = 100;

/* ---------- helpers ---------- */

const requireGroup = (chat, res) => {
  if (!chat.isGroup) {
    res.status(400);
    throw new Error("This action only works in group chats.");
  }
};

const requireAdmin = (chat, userId, res) => {
  if (!chat.admins.some((a) => a.equals(userId))) {
    res.status(403);
    throw new Error("Only group admins can do this.");
  }
};

const removeFile = (filePath) => {
  if (filePath) fs.promises.unlink(filePath).catch(() => {});
};

// basename() stops a stored value from ever pointing outside the covers folder
const deleteCoverFile = (url) => {
  if (url?.startsWith("/uploads/covers/")) {
    removeFile(path.join(UPLOAD_ROOT, "covers", path.basename(url)));
  }
};

const joinNames = (names) =>
  names.length <= 2
    ? names.join(" and ")
    : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

const idsOf = (members) => members.map((m) => String(m._id ?? m));

/* ---------- PATCH /api/chats/:chatId/group  { name?, description?, category? } ---------- */
export const updateGroup = asyncHandler(async (req, res) => {
  const chat = await getChatForMember(req.params.chatId, req.user._id, res);
  requireGroup(chat, res);
  requireAdmin(chat, req.user._id, res);

  const { name, description, category } = req.body;
  let nameChanged = false;
  let descChanged = false;
  let categoryChanged = false;

  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (!trimmed) {
      res.status(400);
      throw new Error("Group name can't be empty.");
    }
    if (trimmed.length > 60) {
      res.status(400);
      throw new Error("Group name is too long (60 characters max).");
    }
    if (trimmed !== chat.name) {
      chat.name = trimmed;
      nameChanged = true;
    }
  }

  if (description !== undefined) {
    const trimmed = String(description).trim();
    if (trimmed.length > 200) {
      res.status(400);
      throw new Error("Description is too long (200 characters max).");
    }
    if (trimmed !== (chat.description || "")) {
      chat.description = trimmed;
      descChanged = true;
    }
  }

  if (category !== undefined) {
    if (!CATEGORY_IDS.includes(category)) {
      res.status(400);
      throw new Error("Choose a category: work, school or friends.");
    }
    if (category !== chat.category) {
      chat.category = category;
      categoryChanged = true;
    }
  }

  // nothing actually changed
  if (!nameChanged && !descChanged && !categoryChanged) {
    return res.json(await populateChat(Chat.findById(chat._id)));
  }

  await chat.save();

  const actor = req.user.name;
  const changeCount = [nameChanged, descChanged, categoryChanged].filter(Boolean).length;

  const text =
    changeCount > 1
      ? `${actor} updated the group info`
      : nameChanged
      ? `${actor} renamed the group to "${chat.name}"`
      : descChanged
      ? `${actor} updated the group description`
      : `${actor} changed the group category to ${CATEGORY_LABELS[chat.category]}`;

  await createSystemMessage(chat._id, req.user._id, text, chat.members);

  const populated = await populateChat(Chat.findById(chat._id));
  emitChatUpdated(populated);

  res.json(populated);
});

/* ---------- POST /api/chats/:chatId/cover  (multipart, field "cover") ---------- */
export const uploadCoverImage = asyncHandler(async (req, res) => {
  let chat;

  // multer already saved the file, so delete it if any check below fails
  try {
    chat = await getChatForMember(req.params.chatId, req.user._id, res);
    requireGroup(chat, res);
    requireAdmin(chat, req.user._id, res);

    if (!req.file) {
      res.status(400);
      throw new Error("Please choose an image.");
    }
  } catch (err) {
    removeFile(req.file?.path);
    throw err;
  }

  const oldCover = chat.cover;
  chat.cover = `/uploads/covers/${req.file.filename}`;
  await chat.save();
  deleteCoverFile(oldCover); // don't keep unused images on disk

  await createSystemMessage(
    chat._id,
    req.user._id,
    `${req.user.name} changed the group photo`,
    chat.members
  );

  const populated = await populateChat(Chat.findById(chat._id));
  emitChatUpdated(populated);

  res.json(populated);
});

/* ---------- POST /api/chats/:chatId/members  { userIds: [...] } ---------- */
export const addMembers = asyncHandler(async (req, res) => {
  const chat = await getChatForMember(req.params.chatId, req.user._id, res);
  requireGroup(chat, res);
  requireAdmin(chat, req.user._id, res);

  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    res.status(400);
    throw new Error("Choose at least one person to add.");
  }
  if (!userIds.every((id) => mongoose.isValidObjectId(id))) {
    res.status(400);
    throw new Error("One or more user ids are invalid.");
  }

  // drop duplicates and people who are already in the group
  const newIds = [...new Set(userIds.map(String))].filter(
    (id) => !chat.members.some((m) => m.equals(id))
  );

  if (newIds.length === 0) {
    res.status(400);
    throw new Error("Those people are already in the group.");
  }
  if (chat.members.length + newIds.length > MAX_MEMBERS) {
    res.status(400);
    throw new Error(`A group can have at most ${MAX_MEMBERS} members.`);
  }

  const users = await User.find({ _id: { $in: newIds } }).select("name");
  if (users.length !== newIds.length) {
    res.status(404);
    throw new Error("One or more users were not found.");
  }

  const existingIds = idsOf(chat.members);

  chat.members.push(...newIds);
  await chat.save();

  // current members see "Ramel added Jessa"; the new people get the whole chat instead
  await createSystemMessage(
    chat._id,
    req.user._id,
    `${req.user.name} added ${joinNames(users.map((u) => u.name))}`,
    existingIds
  );

  const populated = await populateChat(Chat.findById(chat._id));
  emitChatUpdated(populated, existingIds);
  emitChatNewTo(newIds, populated);

    await Promise.all(
    newIds.map((id) =>
      createNotification({
        user: id,
        type: "group_added",
        actor: req.user._id,
        chat: chat._id,
        text: `${req.user.name} added you to ${chat.name}`,
      })
    )
  );

  res.json(populated);
});

/* ---------- DELETE /api/chats/:chatId/members/:userId ---------- */
export const removeMember = asyncHandler(async (req, res) => {
  const chat = await getChatForMember(req.params.chatId, req.user._id, res);
  requireGroup(chat, res);
  requireAdmin(chat, req.user._id, res);

  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    res.status(400);
    throw new Error("Invalid user id.");
  }
  if (req.user._id.equals(userId)) {
    res.status(400);
    throw new Error("Use Leave Group to remove yourself.");
  }
  if (!chat.members.some((m) => m.equals(userId))) {
    res.status(404);
    throw new Error("That person is not in this group.");
  }
  if (chat.admins.some((a) => a.equals(userId))) {
    res.status(403);
    throw new Error("Remove their admin role first, then you can remove them from the group.");
  }

  const target = await User.findById(userId).select("name");

  chat.members = chat.members.filter((m) => !m.equals(userId));
  await chat.save();

  await createSystemMessage(
    chat._id,
    req.user._id,
    `${req.user.name} removed ${target?.name ?? "a member"}`,
    chat.members
  );

  const populated = await populateChat(Chat.findById(chat._id));
  emitChatUpdated(populated); // remaining members only (they're the ones in chat.members now)
  emitChatRemoved(userId, chat._id); // the removed person's screen closes the chat

    await createNotification({
    user: userId,
    type: "group_removed",
    actor: req.user._id,
    chat: chat._id,
    text: `${req.user.name} removed you from ${chat.name}`,
  });

  res.json(populated);
});

/* ---------- POST /api/chats/:chatId/leave ---------- */
export const leaveGroup = asyncHandler(async (req, res) => {
  const chat = await getChatForMember(req.params.chatId, req.user._id, res);
  requireGroup(chat, res);

  const remaining = chat.members.filter((m) => !m.equals(req.user._id));

  // last person out: delete the group and its messages
  if (remaining.length === 0) {
    const oldCover = chat.cover;
    await Message.deleteMany({ chat: chat._id });
    await Chat.deleteOne({ _id: chat._id });
    deleteCoverFile(oldCover);

    emitChatRemoved(req.user._id, chat._id);
    return res.json({ message: "You left the group.", chatId: chat._id });
  }

  chat.members = remaining;
  chat.admins = chat.admins.filter((a) => !a.equals(req.user._id));

  // never leave a group without an admin: promote the oldest remaining member
  let promoted = null;
  if (chat.admins.length === 0) {
    promoted = await User.findById(remaining[0]).select("name");
    chat.admins = [remaining[0]];
  }

  await chat.save();

  await createSystemMessage(
    chat._id,
    req.user._id,
    `${req.user.name} left the group`,
    remaining
  );

  if (promoted) {
    await createSystemMessage(
      chat._id,
      req.user._id,
      `${promoted.name} is now an admin`,
      remaining
    );
  }

  const populated = await populateChat(Chat.findById(chat._id));
  emitChatUpdated(populated);
  emitChatRemoved(req.user._id, chat._id); // closes the chat in all of my tabs

  res.json({ message: "You left the group.", chatId: chat._id });
});

/* ---------- PATCH /api/chats/:chatId/members/:userId/role  { role: "admin" | "member" } ---------- */
export const setMemberRole = asyncHandler(async (req, res) => {
  const chat = await getChatForMember(req.params.chatId, req.user._id, res);
  requireGroup(chat, res);
  requireAdmin(chat, req.user._id, res);

  const { userId } = req.params;
  const { role } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    res.status(400);
    throw new Error("Invalid user id.");
  }
  if (role !== "admin" && role !== "member") {
    res.status(400);
    throw new Error('Role must be "admin" or "member".');
  }
  if (!chat.members.some((m) => m.equals(userId))) {
    res.status(404);
    throw new Error("That person is not in this group.");
  }

  const isAdmin = chat.admins.some((a) => a.equals(userId));
  const makeAdmin = role === "admin";

  // already in that role, so there's nothing to change
  if (isAdmin === makeAdmin) {
    return res.json(await populateChat(Chat.findById(chat._id)));
  }

  // a group is never left without an admin
  if (!makeAdmin && chat.admins.length <= 1) {
    res.status(400);
    throw new Error("A group needs at least one admin. Make someone else an admin first.");
  }

  if (makeAdmin) chat.admins.push(userId);
  else chat.admins = chat.admins.filter((a) => !a.equals(userId));
  await chat.save();

  const target = await User.findById(userId).select("name");
  const actor = req.user.name;
  const targetName = target?.name ?? "a member";

  const text = makeAdmin
    ? `${actor} made ${targetName} an admin`
    : req.user._id.equals(userId)
    ? `${actor} is no longer an admin`
    : `${actor} removed ${targetName} as admin`;

  await createSystemMessage(chat._id, req.user._id, text, chat.members);

  const populated = await populateChat(Chat.findById(chat._id));
    emitChatUpdated(populated);

  await createNotification({
    user: userId,
    type: "group_role",
    actor: req.user._id,
    chat: chat._id,
    text: makeAdmin
      ? `${actor} made you an admin of ${chat.name}`
      : `${actor} removed you as admin of ${chat.name}`,
    meta: { role: makeAdmin ? "admin" : "member" },
  });

  res.json(populated);
});