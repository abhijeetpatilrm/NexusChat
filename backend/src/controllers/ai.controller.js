import aiService from "../lib/aiService.js";
import Message from "../models/message.model.js";

/**
 * Generate smart reply suggestions using AI
 */
export const generateSmartReplies = async (req, res) => {
  try {
    const { lastMessage, conversationId } = req.body;
    const userId = req.user._id;

    if (!lastMessage || !lastMessage.text) {
      return res.status(400).json({ error: "Message text is required" });
    }

    // Optional: Get conversation history for better context
    let conversationHistory = [];
    if (conversationId) {
      const recentMessages = await Message.find({
        $or: [
          { senderId: userId, receiverId: conversationId },
          { senderId: conversationId, receiverId: userId },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("text senderId");

      conversationHistory = recentMessages.reverse().map((msg) => ({
        text: msg.text,
        sender: msg.senderId.toString() === userId.toString() ? "You" : "Them",
      }));
    }

    // Generate suggestions using AI
    const suggestions = await aiService.generateSmartReplies(
      lastMessage.text,
      conversationHistory
    );

    res.status(200).json({
      suggestions,
      isAI: aiService.isEnabled(),
      count: suggestions.length,
    });
  } catch (error) {
    console.error("Error in generateSmartReplies controller:", error.message);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
};

/**
 * Get AI service status
 */
export const getAIStatus = async (req, res) => {
  try {
    res.status(200).json({
      enabled: aiService.isEnabled(),
      provider: "Google Gemini",
      model: "gemini-pro",
    });
  } catch (error) {
    console.error("Error in getAIStatus controller:", error.message);
    res.status(500).json({ error: "Failed to get AI status" });
  }
};
