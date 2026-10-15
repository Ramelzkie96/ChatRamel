const MEMBER_FIELDS = "name email avatar status bio lastSeen";

export default function populateChat(query) {
  return query
    .populate("members", MEMBER_FIELDS)
    .populate("admins", "name")
    .populate({
      path: "lastMessage",
      select: "text type image file sender createdAt seenBy",
      populate: { path: "sender", select: "name" },
    });
}