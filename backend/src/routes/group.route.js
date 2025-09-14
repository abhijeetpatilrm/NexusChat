import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getGroups,
  getGroupMessages,
  sendGroupMessage,
  addGroupMember,
  removeGroupMember,
} from "../controllers/group.controller.js";

const router = express.Router();

// Group management routes
router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.post("/:groupId/messages", protectRoute, sendGroupMessage);
router.post("/:groupId/members", protectRoute, addGroupMember);
router.delete("/:groupId/members", protectRoute, removeGroupMember);

export default router;
