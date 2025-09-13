import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import toast from "react-hot-toast";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to fetch groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      const { groups } = get();
      set({ groups: [res.data, ...groups] });
      toast.success("Group created successfully!");
      return res.data;
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.error || "Failed to create group");
      throw error;
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      console.error("Error fetching group messages:", error);
      toast.error("Failed to fetch group messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/messages`, messageData);
      // Don't add to store here - let the socket event handle it
      return res.data;
    } catch (error) {
      console.error("Error sending group message:", error);
      toast.error("Failed to send message");
      throw error;
    }
  },

  addGroupMember: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, { memberId });
      const { groups } = get();
      const updatedGroups = groups.map(group => 
        group._id === groupId ? res.data : group
      );
      set({ groups: updatedGroups });
      toast.success("Member added successfully!");
    } catch (error) {
      console.error("Error adding group member:", error);
      toast.error(error.response?.data?.error || "Failed to add member");
      throw error;
    }
  },

  removeGroupMember: async (groupId, memberId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}/members`, { data: { memberId } });
      const { groups } = get();
      const updatedGroups = groups.map(group => {
        if (group._id === groupId) {
          return {
            ...group,
            members: group.members.filter(member => member.user._id !== memberId)
          };
        }
        return group;
      });
      set({ groups: updatedGroups });
      toast.success("Member removed successfully!");
    } catch (error) {
      console.error("Error removing group member:", error);
      toast.error(error.response?.data?.error || "Failed to remove member");
      throw error;
    }
  },

  setSelectedGroup: (group) => set({ selectedGroup: group }),

  subscribeToGroupMessages: (groupId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Clean up existing listeners first
    socket.off("newGroupMessage");
    socket.off("groupUpdated");
    socket.off("addedToGroup");
    socket.off("removedFromGroup");

    socket.on("newGroupMessage", (newMessage) => {
      const { groupMessages, selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === newMessage.groupId) {
        set({ groupMessages: [...groupMessages, newMessage] });
      }
    });

    socket.on("groupUpdated", (updatedGroup) => {
      const { groups } = get();
      const updatedGroups = groups.map(group => 
        group._id === updatedGroup._id ? updatedGroup : group
      );
      set({ groups: updatedGroups });
    });

    socket.on("addedToGroup", (newGroup) => {
      const { groups } = get();
      set({ groups: [newGroup, ...groups] });
      toast.success(`Added to group: ${newGroup.name}`);
    });

    socket.on("removedFromGroup", (data) => {
      const { groups, selectedGroup } = get();
      const updatedGroups = groups.filter(group => group._id !== data.groupId);
      set({ groups: updatedGroups });
      
      if (selectedGroup && selectedGroup._id === data.groupId) {
        set({ selectedGroup: null, groupMessages: [] });
        toast.info("You have been removed from this group");
      }
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newGroupMessage");
    socket.off("groupUpdated");
    socket.off("addedToGroup");
    socket.off("removedFromGroup");
  },
}));
