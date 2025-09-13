import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const TypingIndicator = ({ selectedUser }) => {
  const [typingUsers, setTypingUsers] = useState([]);
  const { socket } = useAuthStore();

  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleUserTyping = (data) => {
      const { userId, isTyping, timestamp } = data;
      
      // Only show typing for the selected user
      if (userId !== selectedUser._id) return;

      setTypingUsers(prev => {
        if (isTyping) {
          // Add user to typing list
          const existingUser = prev.find(user => user.userId === userId);
          if (existingUser) {
            return prev.map(user => 
              user.userId === userId 
                ? { ...user, timestamp, isTyping: true }
                : user
            );
          } else {
            return [...prev, { userId, timestamp, isTyping: true }];
          }
        } else {
          // Remove user from typing list
          return prev.filter(user => user.userId !== userId);
        }
      });
    };

    socket.on("userTyping", handleUserTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
    };
  }, [socket, selectedUser]);

  // Auto-remove typing indicator after 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(user => now - user.timestamp < 3000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${selectedUser.fullName} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${selectedUser.fullName} and 1 other are typing...`;
    } else {
      return `${selectedUser.fullName} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {getTypingText()}
      </span>
    </div>
  );
};

export default TypingIndicator;
