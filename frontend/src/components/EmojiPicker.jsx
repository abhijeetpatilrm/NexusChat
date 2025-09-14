import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { Smile, X, Clock } from "lucide-react";

const EmojiPickerComponent = ({ onEmojiSelect, onClose, isOpen }) => {
  const [recentEmojis, setRecentEmojis] = useState([]);
  const pickerRef = useRef(null);

  // Load recent emojis from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recent-emojis");
    if (saved) {
      setRecentEmojis(JSON.parse(saved));
    }
  }, []);

  // Save recent emojis to localStorage
  const saveRecentEmoji = (emoji) => {
    const newRecent = [emoji, ...recentEmojis.filter(e => e.emoji !== emoji.emoji)].slice(0, 20);
    setRecentEmojis(newRecent);
    localStorage.setItem("recent-emojis", JSON.stringify(newRecent));
  };

  const handleEmojiSelect = (emojiData) => {
    const emoji = {
      emoji: emojiData.emoji,
      name: emojiData.names?.[0] || 'emoji'
    };
    saveRecentEmoji(emoji);
    onEmojiSelect(emoji);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full right-0 mb-2 z-50" ref={pickerRef}>
      <div className="bg-base-100 rounded-xl shadow-2xl border border-base-300 overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-base-300 bg-base-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-base-content flex items-center gap-2">
              <Smile className="w-4 h-4" />
              Choose an emoji
            </h3>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recent Emojis */}
        {recentEmojis.length > 0 && (
          <div className="p-3 border-b border-base-300">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-base-content/70" />
              <span className="text-sm font-medium text-base-content/70">Recent</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {recentEmojis.slice(0, 12).map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-base-300 transition-colors text-lg"
                  title={emoji.name}
                >
                  {emoji.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        <div className="max-h-80 overflow-hidden">
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            theme="auto"
            height={320}
            width={320}
            searchDisabled={false}
            skinTonesDisabled={false}
            previewConfig={{
              showPreview: false
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EmojiPickerComponent;
