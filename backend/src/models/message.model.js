import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function() {
        return !this.groupId;
      },
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: function() {
        return !this.receiverId;
      },
    },
    messageType: {
      type: String,
      enum: ['direct', 'group'],
      default: 'direct',
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    file: {
      url: {
        type: String,
      },
      name: {
        type: String,
      },
      size: {
        type: Number,
      },
      type: {
        type: String,
      },
    },
    reactions: {
      type: Map,
      of: [mongoose.Schema.Types.ObjectId],
      default: new Map(),
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    readAt: {
      type: Date,
      default: null,
    },
    readBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
