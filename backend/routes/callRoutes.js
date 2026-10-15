import express from "express";
import { getIceServers, getCallHistory } from "../controllers/callController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/ice-servers", getIceServers); // keep above "/:chatId"
router.get("/:chatId", getCallHistory);

export default router;