import { useState, useEffect } from "react";
import { X, Users, Plus, Search } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { createGroup } = useGroupStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [isOpen]);

  const fetchAvailableUsers = async () => {
    try {
      const res = await axiosInstance.get("/messages/users");
      const filteredUsers = res.data.filter(user => 
        user._id !== authUser._id && 
        !selectedMembers.find(member => member._id === user._id)
      );
      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleMemberSelect = (user) => {
    setSelectedMembers([...selectedMembers, user]);
    setAvailableUsers(availableUsers.filter(u => u._id !== user._id));
    setSearchQuery("");
  };

  const handleMemberRemove = (userId) => {
    const removedMember = selectedMembers.find(member => member._id === userId);
    setSelectedMembers(selectedMembers.filter(member => member._id !== userId));
    if (removedMember) {
      setAvailableUsers([...availableUsers, removedMember]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted', { groupName: groupName.trim(), selectedMembers: selectedMembers.length });
    
    if (!groupName.trim()) {
      toast.error("Please provide a group name");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating group with data:', {
        name: groupName.trim(),
        description: groupDescription.trim(),
        memberIds: selectedMembers.map(member => member._id),
      });
      
      await createGroup({
        name: groupName.trim(),
        description: groupDescription.trim(),
        memberIds: selectedMembers.map(member => member._id),
      });
      
      // Reset form
      setGroupName("");
      setGroupDescription("");
      setSelectedMembers([]);
      setSearchQuery("");
      
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl my-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create New Group
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full input input-bordered"
              placeholder="Enter group name"
              required
            />
          </div>

          {/* Group Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="w-full textarea textarea-bordered"
              placeholder="Enter group description (optional)"
              rows={3}
            />
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Members ({selectedMembers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{member.fullName}</span>
                    <button
                      type="button"
                      onClick={() => handleMemberRemove(member._id)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and Add Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add Members (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full input input-bordered pr-10"
                placeholder="Search users to add..."
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Available Users */}
            {searchQuery && filteredUsers.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                {filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleMemberSelect(user)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                  >
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400 ml-auto" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isLoading}
              onClick={(e) => {
                console.log('Button clicked', { isLoading, groupName: groupName.trim() });
                handleSubmit(e);
              }}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Create Group
                </>
              )}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
