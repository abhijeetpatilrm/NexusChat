import { X, Shield } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
              {onlineUsers.includes(selectedUser._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-white shadow-lg animate-pulse"></span>
              )}
            </div>
          </div>

          {/* User info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              {/* Subtle encryption indicator */}
              <div className="flex items-center gap-1 text-green-500" title="End-to-end encrypted">
                <Shield className="w-3 h-3" />
              </div>
            </div>
            <p className="text-sm flex items-center gap-1">
              {onlineUsers.includes(selectedUser._id) ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-500 font-medium">Online</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span className="text-base-content/70">Offline</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
