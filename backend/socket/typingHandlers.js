import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import { emitToUsers } from "./emitters.js";
import { isBlockedDM } from "../utils/blockHelpers.js";

export default function typingHandlers(socket) {
  const relay = async (chatId, isTyping) => {
    try {
      if (!mongoose.isValidObjectId(chatId)) return;

      const chat = await Chat.findOne({ _id: chatId, members: socket.user.id })
        .select("members isGroup")
        .lean();
      if (!chat) return; // not in this chat

      // no typing events between people who blocked each other
      if (await isBlockedDM(chat, socket.user.id)) return;

      emitToUsers(
        chat.members.map(String),
        "typing:update",
        { chatId, userId: socket.user.id, name: socket.user.name, isTyping },
        socket.user.id
      );
    } catch (err) {
      console.error("typing error:", err.message);
    }
  };

  socket.on("typing:start", ({ chatId } = {}) => relay(chatId, true));
  socket.on("typing:stop", ({ chatId } = {}) => relay(chatId, false));
}