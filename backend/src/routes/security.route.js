import express from "express";
import { 
  getEncryptionStatus, 
  rotateEncryptionKey, 
  updateSecuritySettings, 
  getSecurityAuditLog,
  testEncryption,
  cleanupLegacyMessages,
  getConversationStats
} from "../controllers/security.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All security routes require authentication
router.use(protectRoute);

// Get encryption status and key information
router.get("/status", getEncryptionStatus);

// Rotate user's encryption key
router.post("/rotate-key", rotateEncryptionKey);

// Update security settings
router.put("/settings", updateSecuritySettings);

// Get security audit log
router.get("/audit-log", getSecurityAuditLog);

// Test encryption functionality
router.post("/test", testEncryption);

// Clean up legacy messages
router.post("/cleanup", cleanupLegacyMessages);

// Get conversation statistics
router.get("/conversation-stats", getConversationStats);

export default router;
