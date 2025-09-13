import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let fileData;
    if (file) {
      // Upload file to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(file.url, {
        resource_type: "raw",
        public_id: `files/${Date.now()}_${file.name}`,
      });
      
      fileData = {
        url: uploadResponse.secure_url,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      file: fileData,
      reactions: new Map(),
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Initialize reactions map if it doesn't exist
    if (!message.reactions) {
      message.reactions = new Map();
    }

    // Convert Map to Object for easier manipulation
    const reactionsObj = message.reactions.toObject ? message.reactions.toObject() : message.reactions;
    
    // Add user to emoji reaction
    if (!reactionsObj[emoji]) {
      reactionsObj[emoji] = [];
    }
    
    if (!reactionsObj[emoji].includes(userId)) {
      reactionsObj[emoji].push(userId);
    }

    // Update the message
    message.reactions = reactionsObj;
    await message.save();

    // Emit reaction update to both users
    const senderSocketId = getReceiverSocketId(message.senderId.toString());
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    
    if (senderSocketId) {
      io.to(senderSocketId).emit("reactionUpdate", { messageId, reactions: reactionsObj });
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("reactionUpdate", { messageId, reactions: reactionsObj });
    }

    res.status(200).json({ messageId, reactions: reactionsObj });
  } catch (error) {
    console.log("Error in addReaction controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Convert Map to Object for easier manipulation
    const reactionsObj = message.reactions.toObject ? message.reactions.toObject() : message.reactions;
    
    // Remove user from emoji reaction
    if (reactionsObj[emoji]) {
      reactionsObj[emoji] = reactionsObj[emoji].filter(id => id.toString() !== userId.toString());
      
      // Remove emoji if no users left
      if (reactionsObj[emoji].length === 0) {
        delete reactionsObj[emoji];
      }
    }

    // Update the message
    message.reactions = reactionsObj;
    await message.save();

    // Emit reaction update to both users
    const senderSocketId = getReceiverSocketId(message.senderId.toString());
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    
    if (senderSocketId) {
      io.to(senderSocketId).emit("reactionUpdate", { messageId, reactions: reactionsObj });
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("reactionUpdate", { messageId, reactions: reactionsObj });
    }

    res.status(200).json({ messageId, reactions: reactionsObj });
  } catch (error) {
    console.log("Error in removeReaction controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only the receiver can mark as read
    if (message.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized to mark this message as read" });
    }

    // Update message status
    message.status = 'read';
    message.readAt = new Date();
    message.readBy = userId;
    await message.save();

    // Emit status update to sender
    const senderSocketId = getReceiverSocketId(message.senderId.toString());
    console.log("Emitting messageStatusUpdate to sender:", senderSocketId, {
      messageId,
      status: 'read',
      readAt: message.readAt
    });
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageStatusUpdate", {
        messageId,
        status: 'read',
        readAt: message.readAt
      });
    }

    res.status(200).json({ 
      messageId, 
      status: 'read', 
      readAt: message.readAt 
    });
  } catch (error) {
    console.log("Error in markAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const userId = req.user._id;

    // Mark all messages from sender as read
    const result = await Message.updateMany(
      {
        senderId: senderId,
        receiverId: userId,
        status: { $ne: 'read' }
      },
      {
        status: 'read',
        readAt: new Date(),
        readBy: userId
      }
    );

    // Emit status update to sender
    const senderSocketId = getReceiverSocketId(senderId);
    console.log("Emitting allMessagesRead to sender:", senderSocketId, {
      receiverId: userId,
      readAt: new Date()
    });
    if (senderSocketId) {
      io.to(senderSocketId).emit("allMessagesRead", {
        receiverId: userId,
        readAt: new Date()
      });
    }

    res.status(200).json({ 
      updatedCount: result.modifiedCount,
      readAt: new Date()
    });
  } catch (error) {
    console.log("Error in markAllAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
