import { useEffect, useRef } from "react";
import { useGroupStore } from "../store/useGroupStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { formatMessageTime } from "../lib/utils.js";
import GroupChatHeader from "./GroupChatHeader.jsx";
import GroupMessageInput from "./GroupMessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import EmojiReactions from "./EmojiReactions.jsx";
import MessageStatus from "./MessageStatus.jsx";
import FilePreview from "./FilePreview.jsx";

const GroupChatContainer = () => {
  const {
    selectedGroup,
    groupMessages,
    getGroupMessages,
    isGroupMessagesLoading,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  } = useGroupStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
      subscribeToGroupMessages(selectedGroup._id);
    }

    return () => {
      unsubscribeFromGroupMessages();
    };
  }, [selectedGroup, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  useEffect(() => {
    if (messageEndRef.current && groupMessages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  if (!selectedGroup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-base-content mb-2">Select a Group</h3>
          <p className="text-base-content/70">Choose a group from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  if (isGroupMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col bg-base-100">
        <GroupChatHeader group={selectedGroup} />
        <div className="flex-1 overflow-y-auto p-4">
          <MessageSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-base-100">
      <GroupChatHeader group={selectedGroup} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-base-content mb-2">No messages yet</h3>
              <p className="text-base-content/70">Start the conversation in {selectedGroup.name}</p>
            </div>
          </div>
        ) : (
          groupMessages.map((message) => (
            <div
              key={message._id}
              className={`flex gap-3 ${
                message.senderId._id === authUser._id ? "justify-end" : "justify-start"
              }`}
            >
              {message.senderId._id !== authUser._id && (
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full">
                    <img
                      src={message.senderId.profilePic || "/avatar.png"}
                      alt={message.senderId.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex flex-col items-start max-w-xs lg:max-w-md">
                {message.senderId._id !== authUser._id && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-base-content">
                      {message.senderId.fullName}
                    </span>
                    <time className="text-xs opacity-50">
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>
                )}
                
                <span className={`px-2 py-1 rounded-lg ${
                  message.senderId._id === authUser._id 
                    ? "bg-primary text-primary-content" 
                    : "bg-base-200 text-base-content"
                }`}>
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  
                  {message.file && (
                    <FilePreview 
                      file={message.file} 
                      isOwnMessage={message.senderId._id === authUser._id}
                    />
                  )}
                  
                  {message.text && (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                  
                  {/* Emoji Reactions */}
                  <EmojiReactions
                    messageId={message._id}
                    reactions={message.reactions || {}}
                    onReactionAdd={() => {}} // TODO: Implement group reactions
                    onReactionRemove={() => {}} // TODO: Implement group reactions
                    currentUserId={authUser._id}
                  />
                  
                  {/* Message Status */}
                  <MessageStatus
                    status={message.status || 'sent'}
                    readAt={message.readAt}
                    isOwnMessage={message.senderId._id === authUser._id}
                  />
                </span>
                
                {message.senderId._id === authUser._id && (
                  <div className="flex justify-end mt-1">
                    <time className="text-xs opacity-50">
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messageEndRef} />
      </div>
      
      <GroupMessageInput group={selectedGroup} />
    </div>
  );
};

export default GroupChatContainer;
