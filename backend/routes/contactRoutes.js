import express from "express";
import {
  getContacts,
  addContact,
  removeContact,
  setFavorite,
} from "../controllers/contactController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getContacts);
router.post("/", addContact);
router.patch("/:userId", setFavorite);
router.delete("/:userId", removeContact);

export default router;