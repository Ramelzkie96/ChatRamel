import { assetUrl } from "./api";

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysAgo = (date) => Math.round((startOfDay(new Date()) - startOfDay(new Date(date))) / 86400000);

export const formatClock = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// sidebar time: "10:24 AM" / "Yesterday" / "Sep 28"
export function formatChatTime(date) {
  if (!date) return "";
  const diff = daysAgo(date);
  if (diff <= 0) return formatClock(date);
  if (diff === 1) return "Yesterday";
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
}

// divider inside the message list
export function formatDayLabel(date) {
  const diff = daysAgo(date);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

// "just now" / "5m ago" / "2h ago" / "Yesterday" / "Sep 28"
export function formatLastSeen(date) {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  if (daysAgo(date) === 1) return "Yesterday";
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
}

// turns a chat from the API into the flat shape the sidebar/header components use
export function toListItem(chat, myId, onlineIds = new Set(), lastSeenMap = {}) {
  const other = chat.isGroup ? null : chat.members.find((m) => m._id !== myId) || chat.members[0];
  const last = chat.lastMessage;
  const blockedByMe = !chat.isGroup && Boolean(chat.blockedByMe);

  let preview = "No messages yet";
  if (last) {
    // "📷 Photo" / "📷 caption" for images, "📎 filename" / "📎 caption" for documents
    let body = last.text;
    if (last.image) body = last.text ? `📷 ${last.text}` : "📷 Photo";
    else if (last.file?.name) body = `📎 ${last.text || last.file.name}`;

    if (last.type === "system") preview = last.text;
    else if (last.sender?._id === myId) preview = `You: ${body}`;
    else if (chat.isGroup) preview = `${last.sender?.name?.split(" ")[0] ?? "Someone"}: ${body}`;
    else preview = body;
  }

  return {
    id: chat._id,
    isGroup: chat.isGroup,
    category: chat.isGroup ? chat.category || "" : "",
    name: chat.isGroup ? chat.name : other?.name ?? "Unknown",
    avatar: chat.isGroup ? assetUrl(chat.cover) : other?.avatar,
    // live presence replaces the status saved in the database; hidden for people I blocked
    status:
      chat.isGroup || blockedByMe ? undefined : onlineIds.has(other?._id) ? "online" : "offline",
    lastSeen: other && !blockedByMe ? lastSeenMap[other._id] ?? other.lastSeen : null,
    blockedByMe,
    memberCount: chat.members.length,
    lastMessage: preview,
    time: last ? formatChatTime(last.createdAt) : "",
    unread: chat.unread ?? 0,
    other,
  };
}