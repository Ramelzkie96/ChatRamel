import mongoose from "mongoose";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { emitBlockUpdate } from "../socket/emitters.js";

const checkTarget = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    res.status(400);
    throw new Error("Invalid user id.");
  }
  if (req.user._id.equals(userId)) {
    res.status(400);
    throw new Error("You can't block yourself.");
  }

  const target = await User.findById(userId).select("_id");
  if (!target) {
    res.status(404);
    throw new Error("User not found.");
  }
  return target._id;
};

// POST /api/users/:userId/block
export const blockUser = asyncHandler(async (req, res) => {
  const targetId = await checkTarget(req, res);

  await User.updateOne({ _id: req.user._id }, { $addToSet: { blockedUsers: targetId } });
  emitBlockUpdate(req.user._id, targetId, true); // my other tabs only

  res.json({ userId: targetId, blocked: true });
});

// DELETE /api/users/:userId/block
export const unblockUser = asyncHandler(async (req, res) => {
  const targetId = await checkTarget(req, res);

  await User.updateOne({ _id: req.user._id }, { $pull: { blockedUsers: targetId } });
  emitBlockUpdate(req.user._id, targetId, false);

  res.json({ userId: targetId, blocked: false });
});

// GET /api/users/blocked  → for a future Settings screen
export const getBlockedUsers = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user._id)
    .select("+blockedUsers")
    .populate("blockedUsers", "name email avatar");

  res.json(me?.blockedUsers ?? []);
});