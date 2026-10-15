import mongoose from "mongoose";

// one document per finished call (a call log); live calls only exist in memory
const callSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    callee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["video", "audio"], required: true },
    status: {
      type: String,
      enum: ["completed", "missed", "declined", "cancelled"],
      required: true,
    },
    answeredAt: { type: Date },
    endedAt: { type: Date },
    duration: { type: Number, default: 0 }, // seconds
  },
  { timestamps: true }
);

callSchema.index({ chat: 1, createdAt: -1 });

export default mongoose.model("Call", callSchema);