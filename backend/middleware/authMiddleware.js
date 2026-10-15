import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401);
    throw new Error("Not logged in.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error("Session expired. Please log in again.");
  }

  const user = await User.findById(decoded.id);
  if (!user || user.deletedAt) {
    res.status(401);
    throw new Error("User no longer exists.");
  }

  // a token issued before the last password change is no longer valid
  if (
    user.passwordChangedAt &&
    decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
  ) {
    res.status(401);
    throw new Error("Your password was changed. Please log in again.");
  }

  req.user = user;
  next();
});