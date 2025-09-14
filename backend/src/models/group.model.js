import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    groupPic: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      allowMembersToInvite: {
        type: Boolean,
        default: true,
      },
      allowMembersToChangeGroupInfo: {
        type: Boolean,
        default: false,
      },
      allowMembersToSendMessages: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

// Index for better query performance
groupSchema.index({ members: 1 });
groupSchema.index({ createdBy: 1 });

const Group = mongoose.model("Group", groupSchema);

export default Group;
