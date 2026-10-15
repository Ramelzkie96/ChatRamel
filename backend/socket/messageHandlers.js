import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import { emitToUsers } from "./emitters.js";
import { isBlockedDM } from "../utils/blockHelpers.js";

export default function messageHandlers(socket) {
  // the user opened a chat (or a message arrived while it was open)
  socket.on("message:seen", async ({ chatId } = {}) => {
    try {
      if (!mongoose.isValidObjectId(chatId)) return;

      const chat = await Chat.findOne({ _id: chatId, members: socket.user.id })
        .select("members isGroup")
        .lean();
      if (!chat) return;

      const result = await Message.updateMany(
        { chat: chatId, seenBy: { $ne: socket.user.id } },
        { $addToSet: { seenBy: socket.user.id } }
      );

      // nothing new was marked, so there's nobody to tell
      if (result.modifiedCount === 0) return;

      // between blocked people, only my own tabs hear about it (to clear my badge);
      // the other person's check marks don't change
      const blocked = await isBlockedDM(chat, socket.user.id);
      const recipients = blocked ? [socket.user.id] : chat.members.map(String);

      emitToUsers(recipients, "message:seen", { chatId, userId: socket.user.id });
    } catch (err) {
      console.error("seen error:", err.message);
    }
  });
}