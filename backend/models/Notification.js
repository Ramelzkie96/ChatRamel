import mongoose from "mongoose";

export const NOTIFICATION_TYPES = ["missed_call", "group_added", "group_removed", "group_role"];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who receives it
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // who caused it
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", default: null },
    text: { type: String, required: true, maxlength: 300 },

    // small extras per type: callType for missed calls, role for role changes
    meta: {
      callType: { type: String },
      role: { type: String },
    },

    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// "my notifications, newest first"
notificationSchema.index({ user: 1, createdAt: -1 });

// old notifications delete themselves after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

notificationSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Notification", notificationSchema);