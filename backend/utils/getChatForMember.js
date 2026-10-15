import mongoose from "mongoose";
import Chat from "../models/Chat.js";

// Loads a chat and makes sure the logged-in user belongs to it.
// Throws 400 / 404 / 403 so nobody can read a chat by guessing its ID.
export default async function getChatForMember(chatId, userId, res) {
  if (!mongoose.isValidObjectId(chatId)) {
    res.status(400);
    throw new Error("Invalid chat id.");
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error("Chat not found.");
  }

  const isMember = chat.members.some((m) => m.equals(userId));
  if (!isMember) {
    res.status(403);
    throw new Error("You are not a member of this chat.");
  }

  return chat;
}