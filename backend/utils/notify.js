import Notification from "../models/Notification.js";
import { emitNotification } from "../socket/emitters.js";

// Saves a notification and pushes it live to the person's tabs.
// It never throws, so a notification problem can't break the action that caused it.
export default async function createNotification({ user, type, actor = null, chat = null, text, meta }) {
  try {
    // you never get a notification for something you did yourself
    if (actor && String(actor) === String(user)) return null;

    const doc = await Notification.create({
      user,
      type,
      actor,
      chat,
      text: String(text).slice(0, 300),
      ...(meta ? { meta } : {}),
    });

    await doc.populate("actor", "name avatar");
    emitNotification(user, doc);
    return doc;
  } catch (err) {
    console.error("notification error:", err.message);
    return null;
  }
}