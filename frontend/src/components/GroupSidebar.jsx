import { useState } from "react";
import { Users, Plus, MessageCircle } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import CreateGroupModal from "./CreateGroupModal.jsx";

const GroupSidebar = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { groups, selectedGroup, setSelectedGroup, getGroups } = useGroupStore();
  const { authUser } = useAuthStore();

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const getGroupDisplayName = (group) => {
    if (group.name) return group.name;
    
    // If no name, show member names
    const otherMembers = group.members
      .filter(member => member.user._id !== authUser._id)
      .map(member => member.user.fullName);
    
    if (otherMembers.length === 0) return "You";
    if (otherMembers.length === 1) return otherMembers[0];
    if (otherMembers.length === 2) return otherMembers.join(", ");
    return `${otherMembers[0]} and ${otherMembers.length - 1} others`;
  };

  const getGroupAvatar = (group) => {
    if (group.groupPic) {
      return group.groupPic;
    }
    
    // Use first member's avatar as group avatar
    const firstMember = group.members.find(member => member.user._id !== authUser._id);
    return firstMember?.user.profilePic || "/avatar.png";
  };

  const getOnlineMembersCount = (group) => {
    // This would need to be implemented with online status tracking
    // For now, return total members
    return group.members.length;
  };

  return (
    <div className="flex flex-col h-full bg-base-200">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-base-content">Groups</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-sm btn-circle btn-primary"
            title="Create new group"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Users className="w-12 h-12 text-base-content/50 mb-4" />
            <p className="text-base-content/70 mb-2">No groups yet</p>
            <p className="text-sm text-base-content/50 mb-4">
              Create a group to start chatting with multiple people
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </button>
          </div>
        ) : (
          <div className="p-2">
            {groups.map((group) => (
              <div
                key={group._id}
                onClick={() => handleGroupSelect(group)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                  selectedGroup?._id === group._id
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-300"
                }`}
              >
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img
                      src={getGroupAvatar(group)}
                      alt={getGroupDisplayName(group)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">
                      {getGroupDisplayName(group)}
                    </h3>
                    {group.members.length > 2 && (
                      <span className="badge badge-sm badge-outline">
                        {group.members.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm opacity-70">
                    <Users className="w-3 h-3" />
                    <span>{getOnlineMembersCount(group)} members</span>
                  </div>
                  
                  {group.description && (
                    <p className="text-xs opacity-60 truncate mt-1">
                      {group.description}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                  <span className="text-xs opacity-50">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default GroupSidebar;
