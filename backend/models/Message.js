import mongoose from "mongoose";

// one reaction per person per message
const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true, maxlength: 32 },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // required for normal messages; for a photo or document it's the optional caption
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
      required: function () {
        return !this.image && !this.file?.url;
      },
    },

    // relative path like "/uploads/messages/abc.png"
    image: { type: String, default: "" },

    // documents: no defaults on purpose, so normal messages have no "file" at all
    file: {
      url: String, // "/uploads/files/<random>.pdf" (private, never served directly)
      name: String, // original name, cleaned: "project-plan.pdf"
      size: Number, // bytes
      mimeType: String,
    },

    reactions: { type: [reactionSchema], default: [] },

    // "system" = automatic lines like "Ramel added Jessa"
    type: { type: String, enum: ["text", "system"], default: "text" },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// fast history loading per chat
messageSchema.index({ chat: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);