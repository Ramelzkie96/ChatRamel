import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markRead,
  deleteNotification,
  clearNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount); // keep above "/:id"
router.patch("/read", markRead);
router.delete("/", clearNotifications);
router.delete("/:id", deleteNotification);

export default router;