import Chat from "../models/Chat.js";

let io = null;

export const setIO = (instance) => {
  io = instance;
};

// mongoose documents -> plain JSON (safe for Socket.io)
const plain = (doc) => JSON.parse(JSON.stringify(doc));

// send an event to every given user (each user has a personal room "user:<id>")
export function emitToUsers(userIds, event, payload, exceptId = null) {
  if (!io) return;

  userIds.forEach((id) => {
    if (exceptId && String(id) === String(exceptId)) return;
    io.to(`user:${id}`).emit(event, payload);
  });
}

// everyone in the chat gets it, including the sender's other tabs
export function emitNewMessage(memberIds, message) {
  emitToUsers(memberIds, "message:new", plain(message));
}

// tell the other members a DM or group was created with them in it
export function emitNewChat(chat, creatorId) {
  const memberIds = chat.members.map((m) => m._id ?? m);
  emitToUsers(memberIds, "chat:new", plain(chat), creatorId);
}

// ids of the chat's members, or null if the user isn't in that chat
export async function getMemberIds(chatId, userId) {
  const chat = await Chat.findOne({ _id: chatId, members: userId }).select("members").lean();
  return chat ? chat.members.map(String) : null;
}

export const broadcast = (event, payload) => io?.emit(event, payload);

// send the full updated chat to its members (or only to userIds if given)
export function emitChatUpdated(chat, userIds = null) {
  const targets = userIds ?? chat.members.map((m) => m._id ?? m);
  emitToUsers(targets, "chat:updated", plain(chat));
}

// send a whole chat to specific people (used for newly added members)
export function emitChatNewTo(userIds, chat) {
  emitToUsers(userIds, "chat:new", plain(chat));
}

// tell one user the chat is gone for them (left, removed, or group deleted)
export function emitChatRemoved(userId, chatId) {
  emitToUsers([userId], "chat:removed", { chatId: String(chatId) });
}

// block / unblock: only the person who did it (all their tabs), never the other person
export function emitBlockUpdate(userId, otherId, blocked) {
  emitToUsers([userId], "block:update", { userId: String(otherId), blocked });
}

// clear chat: only the person who cleared it (all their tabs)
export function emitChatCleared(userId, chatId, clearedAt) {
  emitToUsers([userId], "chat:cleared", { chatId: String(chatId), clearedAt });
}

// one specific connection (used for call signaling, which belongs to a single tab)
export function emitToSocket(socketId, event, payload) {
  if (io && socketId) io.to(socketId).emit(event, payload);
}

// all of a user's tabs except one
export function emitToUserExcept(userId, exceptSocketId, event, payload) {
  io?.to(`user:${userId}`).except(exceptSocketId).emit(event, payload);
}

// contacts: only the owner's own tabs, never the other person
export function emitContactUpdate(userId, action, contact) {
  emitToUsers([userId], "contact:update", { action, contact: plain(contact) });
}

// notifications: only the owner's own tabs
export function emitNotification(userId, notification) {
  emitToUsers([userId], "notification:new", plain(notification));
}

// "read", "readAll", "delete" or "clear" done in one tab, so the other tabs match
export function emitNotificationSync(userId, payload) {
  emitToUsers([userId], "notification:sync", payload);
}

// someone changed their name, photo or bio: tell them and everyone they chat with
export function emitUserUpdated(userIds, payload) {
  emitToUsers(userIds, "user:updated", payload);
}

// the full updated reaction list of one message, to every member of the chat
export function emitReaction(memberIds, payload) {
  emitToUsers(memberIds, "message:reaction", plain(payload));
}