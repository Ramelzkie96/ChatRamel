import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/users?search=jessa
export const searchUsers = asyncHandler(async (req, res) => {
  const term = (req.query.search || "").trim();

  if (term.length < 2) {
    return res.json([]);
  }

  const regex = new RegExp(escapeRegex(term), "i");

  const users = await User.find({
    _id: { $ne: req.user._id },
    deletedAt: null,
    $or: [{ name: regex }, { email: regex }, { username: regex }],
  })
    .select("name email username avatar status bio")
    .limit(20);

  res.json(users);
});