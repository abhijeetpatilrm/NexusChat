import encryptionService from './encryption.js';
import User from '../models/user.model.js';
import CryptoJS from 'crypto-js';

/**
 * Professional Key Management Service
 * Handles encryption key generation, storage, and rotation
 * 
 * Features:
 * - Per-user encryption keys
 * - Key rotation and management
 * - Secure key storage
 * - Key sharing between users
 */

class KeyManager {
  constructor() {
    this.keyRotationInterval = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Generate and store encryption key for user
   * @param {string} userId - User ID
   * @returns {Object} Key information
   */
  async generateUserKey(userId) {
    try {
      const key = encryptionService.generateKey();
      const keyId = this.generateKeyId();
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + this.keyRotationInterval);

      // Store key in user document
      await User.findByIdAndUpdate(userId, {
        $set: {
          encryptionKey: {
            keyId: keyId,
            key: key,
            createdAt: createdAt,
            expiresAt: expiresAt,
            isActive: true
          }
        }
      });

      return {
        keyId: keyId,
        createdAt: createdAt,
        expiresAt: expiresAt,
        status: 'active'
      };
    } catch (error) {
      throw new Error(`Key generation failed: ${error.message}`);
    }
  }

  /**
   * Get user's active encryption key
   * @param {string} userId - User ID
   * @returns {string} Encryption key
   */
  async getUserKey(userId) {
    try {
      const user = await User.findById(userId).select('encryptionKey');
      
      if (!user || !user.encryptionKey || !user.encryptionKey.isActive) {
        // Generate new key if none exists
        await this.generateUserKey(userId);
        const updatedUser = await User.findById(userId).select('encryptionKey');
        return updatedUser.encryptionKey.key;
      }

      // Check if key is expired
      if (new Date() > user.encryptionKey.expiresAt) {
        await this.rotateUserKey(userId);
        const updatedUser = await User.findById(userId).select('encryptionKey');
        return updatedUser.encryptionKey.key;
      }

      return user.encryptionKey.key;
    } catch (error) {
      throw new Error(`Key retrieval failed: ${error.message}`);
    }
  }

  /**
   * Rotate user's encryption key
   * @param {string} userId - User ID
   * @returns {Object} New key information
   */
  async rotateUserKey(userId) {
    try {
      // Deactivate old key
      await User.findByIdAndUpdate(userId, {
        $set: {
          'encryptionKey.isActive': false,
          'encryptionKey.rotatedAt': new Date()
        }
      });

      // Generate new key
      return await this.generateUserKey(userId);
    } catch (error) {
      throw new Error(`Key rotation failed: ${error.message}`);
    }
  }

  /**
   * Generate shared key for conversation
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {string} Shared encryption key
   */
  async generateSharedKey(userId1, userId2) {
    try {
      // Create deterministic shared key based on user IDs (sorted for consistency)
      const sortedIds = [userId1.toString(), userId2.toString()].sort();
      const keyMaterial = `${sortedIds[0]}-${sortedIds[1]}`;
      
      // Use a simpler key derivation for better compatibility
      const key = CryptoJS.SHA256(keyMaterial + 'shared-salt').toString(CryptoJS.enc.Base64);
      
      return key;
    } catch (error) {
      throw new Error(`Shared key generation failed: ${error.message}`);
    }
  }

  /**
   * Generate unique key ID
   * @returns {string} Unique key identifier
   */
  generateKeyId() {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate encryption key
   * @param {string} key - Key to validate
   * @returns {boolean} True if key is valid
   */
  validateKey(key) {
    try {
      // Check if key is valid Base64
      const decoded = Buffer.from(key, 'base64');
      return decoded.length === 32; // 256 bits = 32 bytes
    } catch (error) {
      return false;
    }
  }

  /**
   * Get key statistics for user
   * @param {string} userId - User ID
   * @returns {Object} Key statistics
   */
  async getKeyStats(userId) {
    try {
      const user = await User.findById(userId).select('encryptionKey');
      
      if (!user || !user.encryptionKey) {
        return {
          hasKey: false,
          keyAge: null,
          expiresIn: null,
          status: 'no_key'
        };
      }

      const now = new Date();
      const createdAt = user.encryptionKey.createdAt;
      const expiresAt = user.encryptionKey.expiresAt;
      
      return {
        hasKey: true,
        keyAge: Math.floor((now - createdAt) / (1000 * 60 * 60)), // hours
        expiresIn: Math.floor((expiresAt - now) / (1000 * 60 * 60)), // hours
        status: user.encryptionKey.isActive ? 'active' : 'inactive',
        keyId: user.encryptionKey.keyId
      };
    } catch (error) {
      throw new Error(`Key stats retrieval failed: ${error.message}`);
    }
  }
}

// Create singleton instance
const keyManager = new KeyManager();

export default keyManager;
