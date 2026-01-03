import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

/**
 * AI-Powered Smart Reply Service using Google Gemini
 * Generates intelligent, context-aware reply suggestions
 */

class AIService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn(
        "⚠️ GEMINI_API_KEY not found. AI features will be disabled."
      );
      this.enabled = false;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      this.enabled = true;
      console.log("✅ Google Gemini AI initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Gemini AI:", error.message);
      this.enabled = false;
    }
  }

  /**
   * Generate smart reply suggestions using AI
   * @param {string} lastMessage - The last message received
   * @param {Array} conversationHistory - Optional conversation context
   * @returns {Promise<Array>} Array of suggested replies
   */
  async generateSmartReplies(lastMessage, conversationHistory = []) {
    // Fallback to pattern-based suggestions if AI is disabled
    if (!this.enabled) {
      return this.getFallbackSuggestions(lastMessage);
    }

    try {
      // Build context from conversation history
      const contextText =
        conversationHistory.length > 0
          ? `Recent conversation:\n${conversationHistory
              .map((m) => `${m.sender}: ${m.text}`)
              .join("\n")}\n\n`
          : "";

      const prompt = `${contextText}Generate exactly 4 short, casual, friendly reply suggestions for this message: "${lastMessage}"

Requirements:
- Each reply should be under 15 words
- Use appropriate emojis
- Be conversational and natural
- Match the tone of the message
- Don't number the replies
- One reply per line

Reply suggestions:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse and clean the suggestions
      const suggestions = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .filter((line) => !line.match(/^\d+[\.\)]/)) // Remove numbered lines
        .slice(0, 4);

      // If we got valid suggestions, return them
      if (suggestions.length > 0) {
        console.log("✨ Generated AI suggestions:", suggestions.length);
        return suggestions;
      }

      // Fallback if parsing failed
      return this.getFallbackSuggestions(lastMessage);
    } catch (error) {
      console.error("AI generation error:", error.message);
      // Return fallback suggestions on error
      return this.getFallbackSuggestions(lastMessage);
    }
  }

  /**
   * Fallback pattern-based suggestions (used when AI fails or is disabled)
   * @param {string} message - The message to respond to
   * @returns {Array} Array of suggested replies
   */
  getFallbackSuggestions(message) {
    const lowerMessage = message.toLowerCase();

    // Pattern-based suggestions (simple fallback)
    const patterns = {
      greeting: {
        test: (msg) =>
          /\b(hi|hello|hey|good morning|good afternoon)\b/.test(msg),
        replies: [
          "Hello! 👋",
          "Hi there! 😊",
          "Hey! How are you?",
          "Good to see you! ✨",
        ],
      },
      question: {
        test: (msg) =>
          msg.includes("?") || /\b(what|when|where|why|how)\b/.test(msg),
        replies: [
          "Good question! 🤔",
          "Let me think about that...",
          "That's interesting! 🤓",
          "I'm not sure, what do you think?",
        ],
      },
      thanks: {
        test: (msg) => /\b(thank|thanks|appreciate)\b/.test(msg),
        replies: [
          "You're welcome! 😊",
          "No problem at all! 👍",
          "Happy to help! ✨",
          "Anytime! 😄",
        ],
      },
      positive: {
        test: (msg) =>
          /\b(great|awesome|amazing|wonderful|excellent|perfect)\b/.test(msg),
        replies: [
          "That's awesome! 🎉",
          "I'm so happy for you! 😊",
          "That sounds amazing! ✨",
          "Love to hear that! ❤️",
        ],
      },
      negative: {
        test: (msg) => /\b(bad|terrible|awful|sad|upset|sorry)\b/.test(msg),
        replies: [
          "I'm sorry to hear that 😔",
          "That sounds tough 💙",
          "Is there anything I can do?",
          "Sending you good vibes! ✨",
        ],
      },
    };

    // Find matching pattern
    for (const [category, data] of Object.entries(patterns)) {
      if (data.test(lowerMessage)) {
        return data.replies;
      }
    }

    // Default generic replies
    return [
      "That's interesting! 🤔",
      "Tell me more! 😊",
      "I see! 👍",
      "Got it! ✨",
    ];
  }

  /**
   * Check if AI service is enabled and ready
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }
}

// Create singleton instance
const aiService = new AIService();

export default aiService;
