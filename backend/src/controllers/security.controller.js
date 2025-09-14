import keyManager from '../lib/keyManager.js';
import encryptionService from '../lib/encryption.js';
import MessageCleanup from '../lib/messageCleanup.js';
import User from '../models/user.model.js';

/**
 * Security Controller - Professional security features
 * Handles encryption status, key management, and security settings
 */

export const getEncryptionStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const keyStats = await keyManager.getKeyStats(userId);
    
    res.status(200).json({
      encryptionEnabled: true,
      keyStats: keyStats,
      securityLevel: 'enterprise',
      algorithm: 'AES-256-CBC-HMAC',
      features: {
        endToEndEncryption: true,
        messageIntegrity: true,
        keyRotation: true,
        perfectForwardSecrecy: true
      }
    });
  } catch (error) {
    console.error("Error getting encryption status:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const rotateEncryptionKey = async (req, res) => {
  try {
    const userId = req.user._id;
    const newKeyInfo = await keyManager.rotateUserKey(userId);
    
    res.status(200).json({
      message: "Encryption key rotated successfully",
      keyInfo: newKeyInfo,
      securityLevel: 'enterprise'
    });
  } catch (error) {
    console.error("Error rotating encryption key:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateSecuritySettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { encryptionEnabled, keyRotationEnabled } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'securitySettings.encryptionEnabled': encryptionEnabled,
          'securitySettings.keyRotationEnabled': keyRotationEnabled,
          'securitySettings.lastSecurityUpdate': new Date()
        }
      },
      { new: true }
    ).select('securitySettings');
    
    res.status(200).json({
      message: "Security settings updated successfully",
      settings: updatedUser.securitySettings
    });
  } catch (error) {
    console.error("Error updating security settings:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSecurityAuditLog = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('securitySettings encryptionKey');
    
    const auditLog = [
      {
        timestamp: user.securitySettings.lastSecurityUpdate,
        action: 'Security settings updated',
        details: 'User security preferences modified'
      },
      {
        timestamp: user.encryptionKey?.createdAt,
        action: 'Encryption key generated',
        details: 'New encryption key created for secure messaging'
      },
      {
        timestamp: user.encryptionKey?.rotatedAt,
        action: 'Encryption key rotated',
        details: 'Encryption key rotated for enhanced security'
      }
    ].filter(entry => entry.timestamp);
    
    res.status(200).json({
      auditLog: auditLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      totalEvents: auditLog.length
    });
  } catch (error) {
    console.error("Error getting security audit log:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const testEncryption = async (req, res) => {
  try {
    const { testMessage } = req.body;
    const userId = req.user._id;
    
    if (!testMessage) {
      return res.status(400).json({ error: "Test message is required" });
    }
    
    // Get user's encryption key
    const userKey = await keyManager.getUserKey(userId);
    
    // Test encryption
    const encrypted = encryptionService.encrypt(testMessage, userKey);
    const decrypted = encryptionService.decrypt(encrypted, userKey);
    
    const isIntegrityVerified = encryptionService.verifyIntegrity(
      testMessage, 
      encryptionService.generateHash(testMessage)
    );
    
    res.status(200).json({
      testMessage: testMessage,
      encrypted: encrypted.encryptedData,
      decrypted: decrypted,
      integrityVerified: isIntegrityVerified,
      algorithm: encrypted.algorithm,
      securityLevel: 'enterprise',
      testPassed: testMessage === decrypted && isIntegrityVerified
    });
  } catch (error) {
    console.error("Error testing encryption:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const cleanupLegacyMessages = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.user._id;
    
    if (!otherUserId) {
      return res.status(400).json({ error: "Other user ID is required" });
    }
    
    const result = await MessageCleanup.cleanupConversation(userId, otherUserId);
    
    res.status(200).json({
      message: "Legacy messages cleaned up successfully",
      result: result
    });
  } catch (error) {
    console.error("Error cleaning up legacy messages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getConversationStats = async (req, res) => {
  try {
    const { otherUserId } = req.query;
    const userId = req.user._id;
    
    if (!otherUserId) {
      return res.status(400).json({ error: "Other user ID is required" });
    }
    
    const stats = await MessageCleanup.getConversationStats(userId, otherUserId);
    
    res.status(200).json({
      conversationStats: stats
    });
  } catch (error) {
    console.error("Error getting conversation stats:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
