import User from "../models/User.js";

const idOf = (m) => String(m._id ?? m);

// the other person in a direct chat
export const otherMemberId = (chat, myId) =>
  chat.members.map(idOf).find((id) => id !== String(myId)) ?? null;

// ids of the people I blocked
export async function getBlockedSet(userId) {
  const me = await User.findById(userId).select("+blockedUsers").lean();
  return new Set((me?.blockedUsers ?? []).map(String));
}

// did I block them, did they block me
export async function getBlockState(myId, otherId) {
  const users = await User.find({ _id: { $in: [myId, otherId] } })
    .select("+blockedUsers")
    .lean();

  const me = users.find((u) => String(u._id) === String(myId));
  const other = users.find((u) => String(u._id) === String(otherId));

  return {
    blockedByMe: Boolean(me?.blockedUsers?.some((id) => String(id) === String(otherId))),
    blockedByThem: Boolean(other?.blockedUsers?.some((id) => String(id) === String(myId))),
  };
}

// true when this is a direct chat and either person blocked the other (works with lean chats)
export async function isBlockedDM(chat, userId) {
  if (chat.isGroup) return false;
  const otherId = otherMemberId(chat, userId);
  if (!otherId) return false;

  const { blockedByMe, blockedByThem } = await getBlockState(userId, otherId);
  return blockedByMe || blockedByThem;
}

// throws 403 if this user may not send into this chat.
// The person who was blocked gets a neutral message that doesn't reveal the block.
export async function assertCanMessage(chat, userId, res) {
  if (chat.isGroup) return;
  const otherId = otherMemberId(chat, userId);
  if (!otherId) return;

  const { blockedByMe, blockedByThem } = await getBlockState(userId, otherId);

  if (blockedByMe) {
    res.status(403);
    throw new Error("You blocked this person. Unblock to send messages.");
  }
  if (blockedByThem) {
    res.status(403);
    throw new Error("This message couldn't be sent.");
  }
}