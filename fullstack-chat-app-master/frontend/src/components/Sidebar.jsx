import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, MessageSquare } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { groups, selectedGroup, setSelectedGroup } = useGroupStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("direct"); // "direct" or "groups"

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Clear selections when switching tabs
    if (tab === "direct") {
      setSelectedGroup(null);
    } else {
      setSelectedUser(null);
    }
  };

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Tab Navigation */}
      <div className="border-b border-base-300">
        <div className="flex">
          <button
            onClick={() => handleTabChange("direct")}
            className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
              activeTab === "direct"
                ? "text-primary border-b-2 border-primary bg-base-200"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden lg:block">Direct</span>
          </button>
          <button
            onClick={() => handleTabChange("groups")}
            className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
              activeTab === "groups"
                ? "text-primary border-b-2 border-primary bg-base-200"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden lg:block">Groups</span>
          </button>
        </div>
      </div>

      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          {activeTab === "direct" ? (
            <>
              <MessageSquare className="size-6" />
              <span className="font-medium hidden lg:block">Direct Messages</span>
            </>
          ) : (
            <>
              <Users className="size-6" />
              <span className="font-medium hidden lg:block">Groups</span>
            </>
          )}
        </div>
        {activeTab === "direct" && (
          <div className="mt-3 hidden lg:flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
            <span className="text-xs text-green-500 font-medium">({onlineUsers.length - 1} online)</span>
          </div>
        )}
      </div>

      <div className="overflow-y-auto w-full py-3">
        {activeTab === "direct" ? (
          filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-white shadow-lg animate-pulse"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm flex items-center gap-1">
                {onlineUsers.includes(user._id) ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-500 font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span className="text-zinc-400">Offline</span>
                  </>
                )}
              </div>
            </div>
          </button>
          ))
        ) : (
          // Groups List
          groups.length === 0 ? (
            <div className="text-center text-zinc-500 py-8 px-4">
              <Users className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
              <p className="text-sm">No groups yet</p>
              <p className="text-xs text-zinc-400 mt-1">Create a group to start chatting</p>
            </div>
          ) : (
            groups.map((group) => (
              <button
                key={group._id}
                onClick={() => setSelectedGroup(group)}
                className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-base-300 transition-colors
                  ${selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                `}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={group.groupPic || "/avatar.png"}
                    alt={group.name}
                    className="size-12 object-cover rounded-full"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-base-100"></div>
                </div>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="font-medium text-base-content">{group.name}</span>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-500">Active</span>
                    <span className="text-zinc-400">• {group.members.length} members</span>
                  </div>
                </div>
              </button>
            ))
          )
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
