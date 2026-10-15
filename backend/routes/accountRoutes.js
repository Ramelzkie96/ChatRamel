import express from "express";
import {
  updateProfile,
  setAvatar,
  removeAvatar,
  changeEmail,
  changePassword,
  deleteAccount,
} from "../controllers/accountController.js";
import { uploadAvatar } from "../middleware/uploadMiddleware.js";
import { sensitiveLimiter } from "../middleware/rateLimiter.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.patch("/profile", updateProfile);
router.post("/avatar", uploadAvatar, setAvatar);
router.delete("/avatar", removeAvatar);
router.post("/email", sensitiveLimiter, changeEmail);
router.post("/password", sensitiveLimiter, changePassword);
router.post("/delete", sensitiveLimiter, deleteAccount);

export default router;