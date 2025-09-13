import { useState } from "react";
import { Users, MoreVertical, Settings, UserPlus, UserMinus } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore.js";
import { useAuthStore } from "../store/useAuthStore.js";

const GroupChatHeader = ({ group }) => {
  const [showMembers, setShowMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { authUser } = useAuthStore();

  if (!group) return null;

  const isAdmin = group.admins.includes(authUser._id);
  const onlineMembers = group.members.length; // TODO: Implement real online status

  const getGroupAvatar = () => {
    if (group.groupPic) {
      return group.groupPic;
    }
    
    // Use first member's avatar as group avatar
    const firstMember = group.members.find(member => member.user._id !== authUser._id);
    return firstMember?.user.profilePic || "/avatar.png";
  };

  return (
    <div className="bg-base-200 border-b border-base-300 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full">
              <img
                src={getGroupAvatar()}
                alt={group.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-base-content">
              {group.name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <Users className="w-4 h-4" />
              <span>{onlineMembers} members</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="btn btn-sm btn-circle btn-ghost"
            title="View members"
          >
            <Users className="w-5 h-5" />
          </button>
          
          {isAdmin && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn btn-sm btn-circle btn-ghost"
              title="Group settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm btn-circle btn-ghost">
              <MoreVertical className="w-5 h-5" />
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <button onClick={() => setShowMembers(true)}>
                  <Users className="w-4 h-4" />
                  View Members
                </button>
              </li>
              {isAdmin && (
                <>
                  <li>
                    <button>
                      <UserPlus className="w-4 h-4" />
                      Add Members
                    </button>
                  </li>
                  <li>
                    <button>
                      <Settings className="w-4 h-4" />
                      Group Settings
                    </button>
                  </li>
                </>
              )}
              <li>
                <button className="text-error">
                  <UserMinus className="w-4 h-4" />
                  Leave Group
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Group Description */}
      {group.description && (
        <div className="mt-2">
          <p className="text-sm text-base-content/70">{group.description}</p>
        </div>
      )}

      {/* Members Modal */}
      {showMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-base-300">
              <h3 className="text-lg font-semibold">Group Members</h3>
              <button
                onClick={() => setShowMembers(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.user._id} className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full">
                        <img
                          src={member.user.profilePic || "/avatar.png"}
                          alt={member.user.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.user.fullName}</span>
                        {member.role === 'admin' && (
                          <span className="badge badge-sm badge-primary">Admin</span>
                        )}
                        {member.user._id === authUser._id && (
                          <span className="badge badge-sm badge-outline">You</span>
                        )}
                      </div>
                      <p className="text-sm text-base-content/70">{member.user.email}</p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-base-content/50">Online</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChatHeader;
