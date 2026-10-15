import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import { validateSignup, validateLogin } from "../utils/validators.js";

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const problem = validateSignup({ name, email, password });
  if (problem) {
    res.status(400);
    throw new Error(problem);
  }

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const user = await User.create({ name, email, password });
  generateToken(res, user._id, true);

  res.status(201).json(user);
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const problem = validateLogin({ email, password });
  if (problem) {
    res.status(400);
    throw new Error(problem);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

  // same message for wrong email and wrong password (doesn't reveal which)
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  generateToken(res, user._id, Boolean(rememberMe));
  res.json(user);
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out." });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});