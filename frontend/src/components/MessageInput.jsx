import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Smile, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "./EmojiPicker";
import SmartReplySuggestions from "./SmartReplySuggestions";
import FilePreview from "./FilePreview";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showSmartReplies, setShowSmartReplies] = useState(true);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const textInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, messages, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/avi',
      'audio/mp3',
      'audio/wav'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("File type not supported");
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview({
        url: reader.result,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFilePreview(null);
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  const handleEmojiSelect = (emoji) => {
    const newText = text + emoji.emoji;
    setText(newText);
    setShowEmojiPicker(false);
    // Focus back to input
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        textInputRef.current.setSelectionRange(newText.length, newText.length);
      }
    }, 0);
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setCursorPosition(e.target.selectionStart);
    
    // Handle typing indicators
    if (socket && selectedUser) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Emit typing start if there's text
      if (newText.trim().length > 0) {
        socket.emit("typing", {
          receiverId: selectedUser._id,
          isTyping: true
        });
        
        // Set timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit("typing", {
            receiverId: selectedUser._id,
            isTyping: false
          });
        }, 2000);
      } else {
        // Emit typing stop if text is empty
        socket.emit("typing", {
          receiverId: selectedUser._id,
          isTyping: false
        });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowEmojiPicker(false);
    }
  };

  const handleSmartReplySelect = (suggestion) => {
    setText(suggestion);
    setShowSmartReplies(false);
    // Focus the input after selecting a suggestion
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        textInputRef.current.setSelectionRange(suggestion.length, suggestion.length);
      }
    }, 0);
  };

  // Get the last message from the other user
  const getLastMessage = () => {
    if (!selectedUser || !messages.length) return null;
    
    // Find the last message from the selected user (not from current user)
    const lastMessage = messages
      .filter(msg => msg.senderId === selectedUser._id)
      .slice(-1)[0];
    
    // Debug logging (commented out for production)
    // console.log('MessageInput Debug:', {
    //   selectedUser: selectedUser?.fullName,
    //   messagesCount: messages.length,
    //   lastMessage: lastMessage?.text,
    //   showSmartReplies,
    //   textEmpty: !text.trim(),
    //   noImagePreview: !imagePreview
    // });
    
    return lastMessage;
  };

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socket && selectedUser) {
        socket.emit("typing", {
          receiverId: selectedUser._id,
          isTyping: false
        });
      }
    };
  }, [socket, selectedUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !filePreview) return;

    // Stop typing indicator when sending message
    if (socket && selectedUser) {
      socket.emit("typing", {
        receiverId: selectedUser._id,
        isTyping: false
      });
    }

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        file: filePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      setFilePreview(null);
      setShowSmartReplies(true); // Show smart replies again after sending
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (documentInputRef.current) documentInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="w-full">
      {/* Smart Reply Suggestions */}
      <SmartReplySuggestions
        lastMessage={getLastMessage()}
        onSuggestionSelect={handleSmartReplySelect}
        isVisible={showSmartReplies && !text.trim() && !imagePreview && !filePreview && selectedUser}
        currentUser={selectedUser}
      />
      
      <div className="p-4">
        {imagePreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                flex items-center justify-center"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        {filePreview && (
          <div className="mb-3">
            <FilePreview 
              file={filePreview} 
              onRemove={removeFile}
              isOwnMessage={true}
            />
          </div>
        )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 relative">
          <input
            ref={textInputRef}
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message... (try :smile: for emojis)"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onSelect={(e) => setCursorPosition(e.target.selectionStart)}
          />
          
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Emoji Picker Button */}
          <div className="relative">
            <button
              type="button"
              className={`btn btn-circle ${showEmojiPicker ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
            >
              <Smile size={20} />
            </button>
            
            {showEmojiPicker && (
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
                isOpen={showEmojiPicker}
              />
            )}
          </div>

          {/* Image Upload Button */}
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
            title="Upload image"
          >
            <Image size={20} />
          </button>

          {/* File Upload Button */}
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${filePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => documentInputRef.current?.click()}
            title="Upload file"
          >
            <Paperclip size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview && !filePreview}
        >
          <Send size={22} />
        </button>
      </form>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={documentInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.mp4,.avi,.mp3,.wav"
        className="hidden"
      />
      </div>
    </div>
  );
};
export default MessageInput;
