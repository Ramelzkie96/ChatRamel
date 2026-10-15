import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import deleteUserData from "../utils/deleteUserData.js";
import { isValidEmail, validateUsername, validateNewPassword } from "../utils/validators.js";
import { UPLOAD_ROOT } from "../middleware/uploadMiddleware.js";
import { emitUserUpdated } from "../socket/emitters.js";

/* ---------- helpers ---------- */

const fail = (res, status, message) => {
  res.status(status);
  throw new Error(message);
};

const removeFile = (filePath) => {
  if (filePath) fs.promises.unlink(filePath).catch(() => {});
};

// basename() stops a stored value from ever pointing outside the avatars folder
const deleteAvatarFile = (url) => {
  if (url?.startsWith("/uploads/avatars/")) {
    removeFile(path.join(UPLOAD_ROOT, "avatars", path.basename(url)));
  }
};

// tells the person (all their tabs) and everyone they share a chat with
const tellPeers = async (user) => {
  try {
    const peers = await Chat.distinct("members", { members: user._id });
    const ids = [...new Set([...peers.map(String), String(user._id)])];

    emitUserUpdated(ids, {
      userId: String(user._id),
      name: user.name,
      username: user.username ?? "",
      avatar: user.avatar,
      bio: user.bio,
    });
  } catch (err) {
    console.error("user update error:", err.message);
  }
};

const loadWithPassword = (id) => User.findById(id).select("+password");

/* ---------- PATCH /api/account/profile  { name?, username?, bio? } ---------- */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name, username, bio } = req.body;
  let changed = false;

  if (name !== undefined) {
    const value = String(name).trim();
    if (!value) fail(res, 400, "Full name is required.");
    if (value.length > 60) fail(res, 400, "Name is too long (60 characters max).");
    if (value !== user.name) {
      user.name = value;
      changed = true;
    }
  }

  if (username !== undefined) {
    const value = String(username).trim().toLowerCase();

    if (value !== (user.username ?? "")) {
      const problem = validateUsername(value);
      if (problem) fail(res, 400, problem);

      if (await User.exists({ username: value, _id: { $ne: user._id } })) {
        fail(res, 409, "That username is already taken.");
      }
      user.username = value;
      changed = true;
    }
  }

  if (bio !== undefined) {
    const value = String(bio).trim();
    if (value.length > 150) fail(res, 400, "Bio is too long (150 characters max).");
    if (value !== (user.bio ?? "")) {
      user.bio = value;
      changed = true;
    }
  }

  if (!changed) return res.json(user);

  try {
    await user.save();
  } catch (err) {
    if (err.code === 11000) fail(res, 409, "That username is already taken.");
    throw err;
  }

  await tellPeers(user);
  res.json(user);
});

/* ---------- POST /api/account/avatar  (multipart, field "avatar") ---------- */
export const setAvatar = asyncHandler(async (req, res) => {
  if (!req.file) fail(res, 400, "Please choose an image.");

  const user = req.user;
  const oldAvatar = user.avatar;
  user.avatar = `/uploads/avatars/${req.file.filename}`;

  try {
    await user.save();
  } catch (err) {
    removeFile(req.file.path); // don't keep a file nobody points to
    throw err;
  }

  deleteAvatarFile(oldAvatar); // don't keep unused images on disk
  await tellPeers(user);
  res.json(user);
});

/* ---------- DELETE /api/account/avatar ---------- */
export const removeAvatar = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user.avatar) return res.json(user);

  const oldAvatar = user.avatar;
  user.avatar = "";
  await user.save();

  deleteAvatarFile(oldAvatar);
  await tellPeers(user);
  res.json(user);
});

/* ---------- POST /api/account/email  { newEmail, password } ---------- */
export const changeEmail = asyncHandler(async (req, res) => {
  const newEmail = String(req.body.newEmail ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");

  if (!isValidEmail(newEmail)) fail(res, 400, "Enter a valid email address.");
  if (!password) fail(res, 400, "Enter your current password.");

  const user = await loadWithPassword(req.user._id);
  if (!(await user.matchPassword(password))) fail(res, 403, "Incorrect password.");

  if (newEmail === user.email) fail(res, 400, "That's already your email address.");
  if (await User.exists({ email: newEmail, _id: { $ne: user._id } })) {
    fail(res, 409, "An account with this email already exists.");
  }

  user.email = newEmail;
  try {
    await user.save();
  } catch (err) {
    if (err.code === 11000) fail(res, 409, "An account with this email already exists.");
    throw err;
  }

  res.json(user);
});

/* ---------- POST /api/account/password  { currentPassword, newPassword } ---------- */
export const changePassword = asyncHandler(async (req, res) => {
  const currentPassword = String(req.body.currentPassword ?? "");
  const newPassword = String(req.body.newPassword ?? "");

  if (!currentPassword) fail(res, 400, "Enter your current password.");
  const problem = validateNewPassword(newPassword);
  if (problem) fail(res, 400, problem);

  const user = await loadWithPassword(req.user._id);
  if (!(await user.matchPassword(currentPassword))) fail(res, 403, "Current password is incorrect.");
  if (await user.matchPassword(newPassword)) {
    fail(res, 400, "Your new password must be different from the current one.");
  }

  // keep the same cookie style: a "remember me" login lasts 30 days, otherwise 1 day
  const old = jwt.decode(req.cookies?.token ?? "");
  const remember = Boolean(old && old.exp - old.iat > 2 * 24 * 60 * 60);

  user.password = newPassword; // hashed by the model before saving
  user.passwordChangedAt = new Date();
  await user.save();

  // every older token is now rejected, so this device gets a fresh one and stays signed in
  generateToken(res, user._id, remember);

  res.json({ message: "Password changed." });
});

/* ---------- POST /api/account/delete  { password } ---------- */
export const deleteAccount = asyncHandler(async (req, res) => {
  const password = String(req.body.password ?? "");
  if (!password) fail(res, 400, "Enter your password to delete your account.");

  const user = await loadWithPassword(req.user._id);
  if (!(await user.matchPassword(password))) fail(res, 403, "Incorrect password.");

  const avatar = user.avatar;
  await deleteUserData(user);
  deleteAvatarFile(avatar);

  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Account deleted." });
});