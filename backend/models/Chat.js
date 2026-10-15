import mongoose from "mongoose";
import { CATEGORY_IDS } from "../utils/groupCategories.js";

const chatSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },

    // groups only
    name: { type: String, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 200, default: "" },
    cover: { type: String, default: "" },
    category: { type: String, enum: [...CATEGORY_IDS, ""], default: "" },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },

    // "Clear chat" is per person: each member can have a time before which they see nothing
    clearedAt: [
      {
        _id: false,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        at: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

// fast lookup of "all chats I'm in", newest activity first
chatSchema.index({ members: 1, updatedAt: -1 });

// never send one person's clear times to anyone (REST or Socket.io)
chatSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.clearedAt;
    return ret;
  },
});

export default mongoose.model("Chat", chatSchema);