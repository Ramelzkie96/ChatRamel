import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // optional; sparse means accounts without a username don't clash with each other
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-z0-9_]+$/,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["online", "busy", "offline"], default: "offline" },
    bio: { type: String, default: "Hey there! I'm using ChatRamel.", maxlength: 150 },
    lastSeen: { type: Date, default: null },

    // people this user blocked (hidden by default, so it never leaks in API responses)
    blockedUsers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      select: false,
    },

    // tokens issued before this moment are rejected (set when the password changes)
    passwordChangedAt: { type: Date, default: null },
    // set when the account is deleted (the row stays, anonymized)
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// hash the password before saving (only when it changed)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

// never send private fields back in JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    delete ret.blockedUsers;
    delete ret.passwordChangedAt;
    delete ret.deletedAt;
    return ret;
  },
});

export default mongoose.model("User", userSchema);