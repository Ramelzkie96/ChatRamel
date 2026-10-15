import express from "express";
import { searchUsers } from "../controllers/userController.js";
import { blockUser, unblockUser, getBlockedUsers } from "../controllers/blockController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", searchUsers);
router.get("/blocked", getBlockedUsers);
router.post("/:userId/block", blockUser);
router.delete("/:userId/block", unblockUser);

export default router;