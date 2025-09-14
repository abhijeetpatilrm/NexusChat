import { useState } from "react";
import { Smile, Plus } from "lucide-react";
import EmojiPicker from "./EmojiPicker";

const EmojiReactions = ({ messageId, reactions = {}, onReactionAdd, onReactionRemove, currentUserId }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState(null);

  const handleEmojiSelect = (emoji) => {
    onReactionAdd(messageId, emoji.emoji);
    setShowPicker(false);
  };

  const handleReactionClick = (emoji) => {
    onReactionRemove(messageId, emoji);
  };

  const getReactionCount = (emoji) => {
    return reactions[emoji] ? reactions[emoji].length : 0;
  };

  const hasUserReacted = (emoji) => {
    return reactions[emoji] && reactions[emoji].includes(currentUserId);
  };

  const reactionEmojis = Object.keys(reactions).filter(emoji => reactions[emoji] && reactions[emoji].length > 0);

  return (
    <div className="flex items-center gap-1 mt-2">
      {/* Existing Reactions */}
      {reactionEmojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          onMouseEnter={() => setHoveredReaction(emoji)}
          onMouseLeave={() => setHoveredReaction(null)}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all duration-200
            ${hasUserReacted(emoji) 
              ? 'bg-primary/20 border border-primary/30' 
              : 'bg-base-200 hover:bg-base-300 border border-transparent'
            }
            ${hoveredReaction === emoji ? 'scale-110 shadow-md' : ''}
          `}
        >
          <span className="text-base">{emoji}</span>
          <span className={`text-xs font-medium ${
            hasUserReacted(emoji) ? 'text-primary' : 'text-base-content/70'
          }`}>
            {getReactionCount(emoji)}
          </span>
        </button>
      ))}

      {/* Add Reaction Button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-base-200 hover:bg-base-300 transition-colors opacity-60 hover:opacity-100"
          title="Add reaction"
        >
          {showPicker ? (
            <Plus className="w-3 h-3 rotate-45" />
          ) : (
            <Smile className="w-3 h-3" />
          )}
        </button>

        {showPicker && (
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowPicker(false)}
            isOpen={showPicker}
          />
        )}
      </div>
    </div>
  );
};

export default EmojiReactions;
