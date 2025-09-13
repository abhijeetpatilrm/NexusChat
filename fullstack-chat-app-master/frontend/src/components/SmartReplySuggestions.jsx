import { useState, useEffect } from "react";
import { Lightbulb, Zap } from "lucide-react";

const SmartReplySuggestions = ({ 
  lastMessage, 
  onSuggestionSelect, 
  isVisible = true,
  currentUser 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Smart reply patterns and responses
  const replyPatterns = {
    // Greetings
    greeting: {
      patterns: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
      responses: ["Hello! 👋", "Hi there! 😊", "Hey! How are you?", "Good to see you! ✨"]
    },
    
    // How are you
    howAreYou: {
      patterns: ["how are you", "how are you doing", "how's it going", "what's up"],
      responses: ["I'm doing great! 😊", "Pretty good, thanks!", "All good here! 👍", "Not bad, how about you?"]
    },
    
    // Questions
    question: {
      patterns: ["what", "when", "where", "why", "how", "?"],
      responses: ["Good question! 🤔", "Let me think about that...", "That's interesting! 🤓", "I'm not sure, what do you think?"]
    },
    
    // Plans/Activities
    plans: {
      patterns: ["plan", "doing", "going", "work", "study", "meet", "today", "tomorrow"],
      responses: ["Sounds good! 👍", "That sounds fun! 🎉", "Good luck with that! 💪", "Let me know how it goes!"]
    },
    
    // Positive responses
    positive: {
      patterns: ["great", "awesome", "amazing", "wonderful", "excellent", "perfect", "love", "like"],
      responses: ["That's awesome! 🎉", "I'm so happy for you! 😊", "That sounds amazing! ✨", "Love to hear that! ❤️"]
    },
    
    // Negative responses
    negative: {
      patterns: ["bad", "terrible", "awful", "hate", "sad", "upset", "angry", "frustrated"],
      responses: ["I'm sorry to hear that 😔", "That sounds tough 💙", "Is there anything I can do?", "Sending you good vibes! ✨"]
    },
    
    // Thanks
    thanks: {
      patterns: ["thank", "thanks", "appreciate", "grateful"],
      responses: ["You're welcome! 😊", "No problem at all! 👍", "Happy to help! ✨", "Anytime! 😄"]
    },
    
    // Goodbye
    goodbye: {
      patterns: ["bye", "goodbye", "see you", "talk later", "catch you later"],
      responses: ["See you later! 👋", "Take care! 😊", "Talk to you soon! ✨", "Have a great day! 🌟"]
    },
    
    // Agreement
    agreement: {
      patterns: ["yes", "yeah", "sure", "okay", "ok", "absolutely", "definitely"],
      responses: ["Great! 👍", "Perfect! ✨", "Awesome! 🎉", "Sounds good! 😊"]
    },
    
    // Disagreement
    disagreement: {
      patterns: ["no", "nope", "not really", "disagree", "don't think"],
      responses: ["I understand 👍", "That's fair 😊", "No worries! ✨", "I see your point 🤔"]
    }
  };

  // Analyze message and generate suggestions
  const analyzeMessage = (message) => {
    if (!message || !message.text) return [];
    
    const text = message.text.toLowerCase();
    const matchedPatterns = [];
    
    // Check for pattern matches
    Object.entries(replyPatterns).forEach(([category, data]) => {
      const hasMatch = data.patterns.some(pattern => {
        if (!pattern || pattern.trim() === '') return false;
        try {
          return text.includes(pattern) || text.match(new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`));
        } catch (e) {
          // Fallback to simple includes if regex fails
          return text.includes(pattern);
        }
      });
      
      if (hasMatch) {
        matchedPatterns.push({
          category,
          responses: data.responses,
          confidence: data.patterns.filter(pattern => text.includes(pattern)).length
        });
      }
    });
    
    // Sort by confidence and get top suggestions
    matchedPatterns.sort((a, b) => b.confidence - a.confidence);
    
    // Generate suggestions from top matches
    const suggestions = [];
    matchedPatterns.slice(0, 2).forEach(match => {
      const randomResponses = match.responses
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
      suggestions.push(...randomResponses);
    });
    
    // Add some generic responses if no specific matches
    if (suggestions.length === 0) {
      const genericResponses = [
        "That's interesting! 🤔",
        "Tell me more! 😊",
        "I see! 👍",
        "Got it! ✨"
      ];
      suggestions.push(...genericResponses.slice(0, 2));
    }
    
    // Add emoji suggestions based on message content
    const emojiSuggestions = generateEmojiSuggestions(text);
    suggestions.push(...emojiSuggestions);
    
    return suggestions.slice(0, 4); // Limit to 4 suggestions
  };

  // Generate emoji suggestions based on message content
  const generateEmojiSuggestions = (text) => {
    const emojiMap = {
      happy: ["😊", "😄", "😃", "✨"],
      sad: ["😔", "😢", "💙", "🤗"],
      excited: ["🎉", "🚀", "⭐", "🔥"],
      love: ["❤️", "💕", "😍", "🥰"],
      thinking: ["🤔", "💭", "🧠", "🤓"],
      celebration: ["🎊", "🎈", "🎁", "🌟"],
      work: ["💼", "📊", "💻", "📈"],
      food: ["🍕", "🍔", "🍰", "☕"],
      weather: ["☀️", "🌧️", "❄️", "🌈"],
      travel: ["✈️", "🚗", "🏖️", "🗺️"]
    };
    
    const suggestions = [];
    
    Object.entries(emojiMap).forEach(([emotion, emojis]) => {
      if (text.includes(emotion) || 
          (emotion === 'happy' && (text.includes('good') || text.includes('great'))) ||
          (emotion === 'sad' && (text.includes('bad') || text.includes('terrible'))) ||
          (emotion === 'excited' && (text.includes('awesome') || text.includes('amazing')))) {
        suggestions.push(emojis[Math.floor(Math.random() * emojis.length)]);
      }
    });
    
    return suggestions.slice(0, 2);
  };

  // Update suggestions when last message changes
  useEffect(() => {
    if (lastMessage && isVisible) {
      setIsLoading(true);
      
      // Simulate AI processing delay for better UX
      setTimeout(() => {
        const newSuggestions = analyzeMessage(lastMessage);
        setSuggestions(newSuggestions);
        setIsLoading(false);
      }, 300);
    } else if (isVisible) {
      // Show some default suggestions even without a last message for testing
      setSuggestions([
        "Hello! 👋",
        "How are you? 😊",
        "What's up? ✨",
        "Good to see you! 🎉"
      ]);
    } else {
      setSuggestions([]);
    }
  }, [lastMessage, isVisible]);

  // Debug logging (commented out for production)
  // console.log('SmartReplySuggestions Debug:', {
  //   isVisible,
  //   lastMessage,
  //   suggestions: suggestions.length,
  //   hasLastMessage: !!lastMessage
  // });

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-base-300 bg-base-50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-base-content/70">Smart Replies</span>
        <Zap className="w-3 h-3 text-yellow-500" />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 w-20 bg-base-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionSelect(suggestion)}
              className="px-3 py-1.5 text-sm bg-base-200 hover:bg-primary hover:text-primary-content 
                       rounded-lg transition-all duration-200 hover:scale-105 
                       border border-transparent hover:border-primary/20
                       flex items-center gap-1"
            >
              {suggestion}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default SmartReplySuggestions;
