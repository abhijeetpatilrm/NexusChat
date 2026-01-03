import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  generateSmartReplies,
  getAIStatus,
} from "../controllers/ai.controller.js";

const router = express.Router();

// Generate smart reply suggestions
router.post("/smart-replies", protectRoute, generateSmartReplies);

// Get AI service status
router.get("/status", protectRoute, getAIStatus);

export default router;
