import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";
import { emitNotificationSync } from "../socket/emitters.js";

// GET /api/notifications?limit=30&before=<ISO date>
export const getNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 50);
  const filter = { user: req.user._id };

  if (req.query.before) {
    const before = new Date(req.query.before);
    if (Number.isNaN(before.getTime())) {
      res.status(400);
      throw new Error("Invalid date.");
    }
    filter.createdAt = { $lt: before };
  }

  const items = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("actor", "name avatar");

  res.json(items);
});

// GET /api/notifications/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, readAt: null });
  res.json({ count });
});

// PATCH /api/notifications/read  { ids: [...] }  or  { all: true }
export const markRead = asyncHandler(async (req, res) => {
  const { ids, all } = req.body;
  const now = new Date();

  if (all === true) {
    await Notification.updateMany({ user: req.user._id, readAt: null }, { readAt: now });
    emitNotificationSync(req.user._id, { action: "readAll" });
    return res.json({ ok: true });
  }

  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    ids.length > 100 ||
    !ids.every((id) => mongoose.isValidObjectId(id))
  ) {
    res.status(400);
    throw new Error("Send up to 100 valid notification ids, or { all: true }.");
  }

  // the user filter means you can only ever change your own notifications
  await Notification.updateMany(
    { user: req.user._id, _id: { $in: ids }, readAt: null },
    { readAt: now }
  );
  emitNotificationSync(req.user._id, { action: "read", ids: ids.map(String) });

  res.json({ ok: true });
});

// DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error("Invalid notification id.");
  }

  const result = await Notification.deleteOne({ _id: id, user: req.user._id });
  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error("Notification not found.");
  }

  emitNotificationSync(req.user._id, { action: "delete", ids: [String(id)] });
  res.json({ ok: true });
});

// DELETE /api/notifications  → clear all
export const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  emitNotificationSync(req.user._id, { action: "clear" });
  res.json({ ok: true });
});