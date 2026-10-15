import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getBlockedSet } from "../utils/blockHelpers.js";
import { emitContactUpdate } from "../socket/emitters.js";

const MAX_CONTACTS = 500;
const USER_FIELDS = "name email avatar bio lastSeen";

// the shape the frontend gets (and the shape sent over the socket)
const present = (row, blockedSet) => ({
  user: {
    _id: String(row.contact._id),
    name: row.contact.name,
    email: row.contact.email,
    avatar: row.contact.avatar,
    bio: row.contact.bio,
    lastSeen: row.contact.lastSeen,
  },
  favorite: row.favorite,
  createdAt: row.createdAt,
  blockedByMe: blockedSet.has(String(row.contact._id)),
});

const checkUserId = (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("A valid userId is required.");
  }
};

// GET /api/contacts
export const getContacts = asyncHandler(async (req, res) => {
  const [rows, blockedSet] = await Promise.all([
    Contact.find({ owner: req.user._id }).populate("contact", USER_FIELDS),
    getBlockedSet(req.user._id),
  ]);

  // a contact whose account no longer exists is skipped
  res.json(rows.filter((r) => r.contact).map((r) => present(r, blockedSet)));
});

// POST /api/contacts  { userId }
export const addContact = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  checkUserId(userId, res);

  if (req.user._id.equals(userId)) {
    res.status(400);
    throw new Error("You can't add yourself as a contact.");
  }

  const target = await User.findById(userId).select("_id");
  if (!target) {
    res.status(404);
    throw new Error("User not found.");
  }

  let row = await Contact.findOne({ owner: req.user._id, contact: target._id });
  let created = false;

  if (!row) {
    const count = await Contact.countDocuments({ owner: req.user._id });
    if (count >= MAX_CONTACTS) {
      res.status(400);
      throw new Error(`You can have at most ${MAX_CONTACTS} contacts.`);
    }

    try {
      row = await Contact.create({ owner: req.user._id, contact: target._id });
      created = true;
    } catch (err) {
      // two requests at once: the other one won, so use its row
      if (err.code !== 11000) throw err;
      row = await Contact.findOne({ owner: req.user._id, contact: target._id });
    }
  }

  await row.populate("contact", USER_FIELDS);
  const payload = present(row, await getBlockedSet(req.user._id));

  if (created) emitContactUpdate(req.user._id, "add", payload); // my other tabs

  res.status(created ? 201 : 200).json(payload);
});

// DELETE /api/contacts/:userId
export const removeContact = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  checkUserId(userId, res);

  const result = await Contact.deleteOne({ owner: req.user._id, contact: userId });
  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error("That person isn't in your contacts.");
  }

  emitContactUpdate(req.user._id, "remove", { user: { _id: String(userId) } });

  res.json({ userId, removed: true });
});

// PATCH /api/contacts/:userId  { favorite: true | false }
export const setFavorite = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { favorite } = req.body;
  checkUserId(userId, res);

  if (typeof favorite !== "boolean") {
    res.status(400);
    throw new Error("favorite must be true or false.");
  }

  const row = await Contact.findOneAndUpdate(
    { owner: req.user._id, contact: userId },
    { favorite },
    { new: true }
  ).populate("contact", USER_FIELDS);

  if (!row?.contact) {
    res.status(404);
    throw new Error("That person isn't in your contacts.");
  }

  const payload = present(row, await getBlockedSet(req.user._id));
  emitContactUpdate(req.user._id, "favorite", payload);

  res.json(payload);
});