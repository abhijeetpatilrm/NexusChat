import mongoose from 'mongoose';
import Message from '../models/message.model.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to clean up problematic encrypted messages
 * Run this once to fix the database
 */

const cleanupMessages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all messages with encryption data
    const messages = await Message.find({
      'encryptedData.encryptedData': { $exists: true }
    });

    console.log(`Found ${messages.length} messages with encryption data`);

    let cleanedCount = 0;
    let errorCount = 0;

    for (const message of messages) {
      try {
        // Check if message has readable text (legacy message)
        if (message.text && typeof message.text === 'string' && message.text.length > 0) {
          // This is a legacy message, remove encryption data
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
        } else {
          // This is a properly encrypted message, keep it
          console.log(`Keeping encrypted message: ${message._id}`);
        }
      } catch (error) {
        console.error(`Error cleaning message ${message._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`Cleanup completed: ${cleanedCount} messages cleaned, ${errorCount} errors`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exit(1);
  }
};

// Run cleanup
cleanupMessages();
