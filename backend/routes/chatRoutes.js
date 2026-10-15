import express from "express";
import {
  getMyChats,
  getChat,
  createOrOpenDM,
  createGroup,
  clearChat,
} from "../controllers/chatController.js";
import {
  updateGroup,
  uploadCoverImage,
  addMembers,
  removeMember,
  setMemberRole,
  leaveGroup,
} from "../controllers/groupController.js";
import { getChatMedia } from "../controllers/mediaController.js";
import { uploadCover } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyChats);
router.post("/", createOrOpenDM);
router.post("/group", createGroup); // keep above "/:chatId"
router.get("/:chatId", getChat);
router.get("/:chatId/media", getChatMedia);
router.post("/:chatId/clear", clearChat);

// group actions
router.patch("/:chatId/group", updateGroup);
router.post("/:chatId/cover", uploadCover, uploadCoverImage);
router.post("/:chatId/members", addMembers);
router.patch("/:chatId/members/:userId/role", setMemberRole);
router.delete("/:chatId/members/:userId", removeMember);
router.post("/:chatId/leave", leaveGroup);

export default router;