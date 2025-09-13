import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    console.log("getUsers() called..."); // 🔍 Debugging step
    set({ isUsersLoading: true });

    try {
      console.log("Making API call to /messages/users..."); // 🔍 Debugging step
      const res = await axiosInstance.get("/messages/users");
      console.log("Response received:", res.data); // 🔍 Debugging step
      set({ users: res.data });
    } catch (error) {
      console.log("Error in getUsers():", error); // 🔍 Debugging step
      toast.error(error.response?.data?.message || "Error fetching users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  addReaction: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.post(`/messages/reaction/${messageId}`, { emoji });
      const { messages } = get();
      const updatedMessages = messages.map(msg => 
        msg._id === messageId ? { ...msg, reactions: res.data.reactions } : msg
      );
      set({ messages: updatedMessages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add reaction");
    }
  },

  removeReaction: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.delete(`/messages/reaction/${messageId}`, { data: { emoji } });
      const { messages } = get();
      const updatedMessages = messages.map(msg => 
        msg._id === messageId ? { ...msg, reactions: res.data.reactions } : msg
      );
      set({ messages: updatedMessages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove reaction");
    }
  },

  markAsRead: async (messageId) => {
    try {
      await axiosInstance.put(`/messages/read/${messageId}`);
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  },

  markAllAsRead: async (senderId) => {
    try {
      console.log("Marking all messages as read for sender:", senderId);
      await axiosInstance.put(`/messages/read-all/${senderId}`);
    } catch (error) {
      console.error("Failed to mark all messages as read:", error);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("reactionUpdate", (reactionData) => {
      const { messages } = get();
      const updatedMessages = messages.map(msg => 
        msg._id === reactionData.messageId ? { ...msg, reactions: reactionData.reactions } : msg
      );
      set({ messages: updatedMessages });
    });

    socket.on("messageStatusUpdate", (statusData) => {
      console.log("Received messageStatusUpdate:", statusData);
      const { messages } = get();
      const updatedMessages = messages.map(msg => 
        msg._id === statusData.messageId ? { 
          ...msg, 
          status: statusData.status,
          readAt: statusData.readAt
        } : msg
      );
      set({ messages: updatedMessages });
    });

    socket.on("allMessagesRead", (readData) => {
      console.log("Received allMessagesRead:", readData);
      const { messages } = get();
      const updatedMessages = messages.map(msg => 
        msg.senderId === readData.receiverId ? { 
          ...msg, 
          status: 'read',
          readAt: readData.readAt
        } : msg
      );
      set({ messages: updatedMessages });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("reactionUpdate");
    socket.off("messageStatusUpdate");
    socket.off("allMessagesRead");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
