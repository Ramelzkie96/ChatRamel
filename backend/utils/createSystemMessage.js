import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import { emitNewMessage } from "../socket/emitters.js";

// Saves a centered "Ramel added Jessa" style line, makes it the chat's lastMessage,
// and pushes it live to recipientIds.
export default async function createSystemMessage(chatId, actorId, text, recipientIds) {
  const message = await Message.create({
    chat: chatId,
    sender: actorId,
    text,
    type: "system",
    seenBy: [actorId],
  });

  await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

  const populated = await message.populate("sender", "name avatar");
  emitNewMessage(recipientIds, populated);

  return populated;
}