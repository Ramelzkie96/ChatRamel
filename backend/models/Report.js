import mongoose from "mongoose";

// a copy of a message at the time of the report, so it stays reviewable even if the chat is cleared later
const evidenceSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    senderName: String,
    text: { type: String, default: "" },
    hasImage: { type: Boolean, default: false },
    hasFile: { type: Boolean, default: false },
    fileName: { type: String, default: "" },
    sentAt: Date,
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reported: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", default: null },
    reason: {
      type: String,
      enum: ["spam", "harassment", "inappropriate", "impersonation", "other"],
      required: true,
    },
    details: { type: String, trim: true, maxlength: 500, default: "" },
    evidence: [evidenceSchema],
    status: { type: String, enum: ["open", "reviewed", "dismissed"], default: "open" },
  },
  { timestamps: true }
);

// "did this person already report that person recently?"
reportSchema.index({ reporter: 1, reported: 1, createdAt: -1 });

export default mongoose.model("Report", reportSchema);