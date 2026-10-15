import { getClearedAt } from "./clearHelpers.js";

// Turns a populated Chat document into the JSON the frontend gets, from ONE user's point of view:
// hides a lastMessage they cleared, and adds blockedByMe (and unread, when given).
export default function presentChat(chat, userId, { blockedSet, unread } = {}) {
  const json = chat.toJSON();

  const cleared = getClearedAt(chat, userId);
  if (cleared && json.lastMessage && new Date(json.lastMessage.createdAt) <= cleared) {
    json.lastMessage = null;
  }

  if (!chat.isGroup && blockedSet) {
    const other = chat.members.find((m) => String(m._id) !== String(userId));
    json.blockedByMe = Boolean(other && blockedSet.has(String(other._id)));
  }

  if (unread !== undefined) json.unread = unread;
  return json;
}