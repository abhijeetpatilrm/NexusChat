import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  addReaction,
  removeReaction,
  markAsRead,
  markAllAsRead,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/chats", protectRoute, getUsersForSidebar);
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.post("/reaction/:messageId", protectRoute, addReaction);
router.delete("/reaction/:messageId", protectRoute, removeReaction);
router.put("/read/:messageId", protectRoute, markAsRead);
router.put("/read-all/:senderId", protectRoute, markAllAsRead);

export default router;
