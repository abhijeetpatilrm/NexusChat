import Message from '../models/message.model.js';
import encryptionService from './encryption.js';
import keyManager from './keyManager.js';

/**
 * Message Cleanup Utility
 * Handles legacy messages and encryption inconsistencies
 */

class MessageCleanup {
  /**
   * Clean up problematic messages in the database
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   */
  static async cleanupConversation(userId1, userId2) {
    try {
      console.log(`Cleaning up conversation between ${userId1} and ${userId2}`);
      
      // Find all messages in this conversation
      const messages = await Message.find({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      });

      let cleanedCount = 0;
      let errorCount = 0;

      for (const message of messages) {
        try {
          // Check if message has problematic encryption data
          const hasEncryptionData = message.encryptedData && 
                                   message.encryptedData.encryptedData && 
                                   message.encryptedData.iv && 
                                   message.encryptedData.authTag;

          // If message has encryption data but also has readable text, it's a legacy message
          if (hasEncryptionData && message.text && typeof message.text === 'string' && message.text.length > 0) {
            // This is a legacy message with partial encryption data
            await Message.findByIdAndUpdate(message._id, {
              $unset: {
                encryptedData: 1
              },
              $set: {
                'encryption.isEncrypted': false,
                'encryption.securityLevel': 'legacy',
                'encryption.encryptedAt': null
              }
            });
            
            cleanedCount++;
            console.log(`Cleaned legacy message: ${message._id}`);
          }
        } catch (error) {
          console.error(`Error cleaning message ${message._id}:`, error.message);
          errorCount++;
        }
      }

      console.log(`Cleanup completed: ${cleanedCount} messages cleaned, ${errorCount} errors`);
      return { cleanedCount, errorCount };
    } catch (error) {
      console.error('Message cleanup failed:', error.message);
      throw error;
    }
  }

  /**
   * Get conversation statistics
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   */
  static async getConversationStats(userId1, userId2) {
    try {
      const messages = await Message.find({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      });

      const stats = {
        total: messages.length,
        encrypted: 0,
        legacy: 0,
        problematic: 0
      };

      for (const message of messages) {
        const hasEncryptionData = message.encryptedData && 
                                 message.encryptedData.encryptedData && 
                                 message.encryptedData.iv && 
                                 message.encryptedData.authTag;

        if (hasEncryptionData && message.encryption?.isEncrypted) {
          stats.encrypted++;
        } else if (message.text && typeof message.text === 'string' && message.text.length > 0) {
          stats.legacy++;
        } else {
          stats.problematic++;
        }
      }

      return stats;
    } catch (error) {
      console.error('Failed to get conversation stats:', error.message);
      throw error;
    }
  }
}

export default MessageCleanup;
