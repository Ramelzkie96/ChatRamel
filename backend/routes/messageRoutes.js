import express from "express";
import {
  getMessages,
  sendMessage,
  sendImageMessage,
  sendFileMessage,
  downloadFile,
  setReaction,
} from "../controllers/messageController.js";
import { uploadMessageImage, uploadMessageFile } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/:chatId", getMessages);
router.post("/:chatId", sendMessage);
router.post("/:chatId/image", uploadMessageImage, sendImageMessage);
router.post("/:chatId/file", uploadMessageFile, sendFileMessage);
router.get("/:chatId/files/:messageId", downloadFile);
router.put("/:chatId/:messageId/reaction", setReaction);

export default router;