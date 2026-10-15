import bcrypt from "bcryptjs";
import crypto from "crypto";
import Chat from "../models/Chat.js";
import Contact from "../models/Contact.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import createSystemMessage from "./createSystemMessage.js";
import populateChat from "./populateChat.js";
import {
  emitChatUpdated,
  emitContactUpdate,
  emitUserUpdated,
} from "../socket/emitters.js";

// Deleting an account keeps the row (so old messages don't point at nothing)
// but removes everything personal and makes the account unusable.
export default async function deleteUserData(user) {
  const userId = user._id;

  // everyone who shares a chat with this person (found before anything changes)
  const peers = (await Chat.distinct("members", { members: userId }))
    .map(String)
    .filter((id) => id !== String(userId));

  // 1. leave every group
  const groups = await Chat.find({ isGroup: true, members: userId });
  for (const chat of groups) {
    const remaining = chat.members.filter((m) => !m.equals(userId));

    // last person out: the group and its messages go too
    if (remaining.length === 0) {
      await Message.deleteMany({ chat: chat._id });
      await Chat.deleteOne({ _id: chat._id });
      continue;
    }

    chat.members = remaining;
    chat.admins = chat.admins.filter((a) => !a.equals(userId));

    // a group is never left without an admin
    let promoted = null;
    if (chat.admins.length === 0) {
      promoted = await User.findById(remaining[0]).select("name");
      chat.admins = [remaining[0]];
    }
    await chat.save();

    await createSystemMessage(chat._id, userId, "A member left the group", remaining);
    if (promoted) {
      await createSystemMessage(chat._id, userId, `${promoted.name} is now an admin`, remaining);
    }

    emitChatUpdated(await populateChat(Chat.findById(chat._id)));
  }

  // 2. contacts, in both directions
  const owners = await Contact.distinct("owner", { contact: userId });
  await Contact.deleteMany({ $or: [{ owner: userId }, { contact: userId }] });
  owners.forEach((owner) =>
    emitContactUpdate(owner, "remove", { user: { _id: String(userId) } })
  );

  // 3. notifications
  await Notification.deleteMany({ user: userId });

  // 4. anonymize the account itself
  const unusablePassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        name: "Deleted user",
        email: `deleted-${userId}@deleted.invalid`,
        avatar: "",
        bio: "",
        status: "offline",
        password: unusablePassword,
        blockedUsers: [],
        deletedAt: new Date(),
        passwordChangedAt: new Date(),
      },
      $unset: { username: "" },
    }
  );

  // 5. everyone's chat list and open chats now show "Deleted user"
  emitUserUpdated(peers, {
    userId: String(userId),
    name: "Deleted user",
    username: "",
    avatar: "",
    bio: "",
  });
}