import mongoose from "mongoose";

// "owner saved contact" (a private list: the other person is never notified)
const contactSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// one row per owner + contact, so adding someone twice can never create a duplicate
contactSchema.index({ owner: 1, contact: 1 }, { unique: true });

export default mongoose.model("Contact", contactSchema);