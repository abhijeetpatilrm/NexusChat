import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const createdBy = req.user._id;

    // Validate that all member IDs exist
    const members = await User.find({ _id: { $in: memberIds } });
    if (members.length !== memberIds.length) {
      return res.status(400).json({ error: "Some members not found" });
    }

    // Create group with creator as admin
    const group = new Group({
      name,
      description,
      createdBy,
      members: [
        {
          user: createdBy,
          role: 'admin',
          joinedAt: new Date(),
        },
        ...memberIds.map(memberId => ({
          user: memberId,
          role: 'member',
          joinedAt: new Date(),
        }))
      ],
      admins: [createdBy],
    });

    await group.save();

    // Populate the group with user details
    const populatedGroup = await Group.findById(group._id)
      .populate('members.user', 'fullName profilePic email')
      .populate('createdBy', 'fullName profilePic email');

    // Notify all members about the new group
    const memberSocketIds = memberIds.map(memberId => getReceiverSocketId(memberId.toString()));
    memberSocketIds.forEach(socketId => {
      if (socketId) {
        io.to(socketId).emit("newGroup", populatedGroup);
      }
    });

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.log("Error in createGroup controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      'members.user': userId,
      isActive: true,
    })
      .populate('members.user', 'fullName profilePic email')
      .populate('createdBy', 'fullName profilePic email')
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getGroups controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Check if user is a member of the group
    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId,
      isActive: true,
    });

    if (!group) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await Message.find({
      groupId: groupId,
      messageType: 'group',
    })
      .populate('senderId', 'fullName profilePic email')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getGroupMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image, file } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    // Check if user is a member of the group
    const group = await Group.findOne({
      _id: groupId,
      'members.user': senderId,
      isActive: true,
    });

    if (!group) {
      return res.status(403).json({ error: "Access denied" });
    }

    let imageUrl;
    if (image) {
      const cloudinary = await import("../lib/cloudinary.js");
      const uploadResponse = await cloudinary.default.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let fileData;
    if (file) {
      const cloudinary = await import("../lib/cloudinary.js");
      const uploadResponse = await cloudinary.default.uploader.upload(file.url, {
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
      groupId,
      messageType: 'group',
      text,
      image: imageUrl,
      file: fileData,
      reactions: new Map(),
    });

    await newMessage.save();

    // Populate the message with sender details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'fullName profilePic email');

    // Emit to all group members
    const memberSocketIds = group.members
      .map(member => getReceiverSocketId(member.user.toString()))
      .filter(socketId => socketId);

    memberSocketIds.forEach(socketId => {
      io.to(socketId).emit("newGroupMessage", populatedMessage);
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user._id;

    // Check if user is admin
    const group = await Group.findOne({
      _id: groupId,
      admins: userId,
      isActive: true,
    });

    if (!group) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if member already exists
    const existingMember = group.members.find(member => 
      member.user.toString() === memberId
    );

    if (existingMember) {
      return res.status(400).json({ error: "Member already in group" });
    }

    // Add new member
    group.members.push({
      user: memberId,
      role: 'member',
      joinedAt: new Date(),
    });

    await group.save();

    // Populate and notify
    const populatedGroup = await Group.findById(groupId)
      .populate('members.user', 'fullName profilePic email')
      .populate('createdBy', 'fullName profilePic email');

    // Notify the new member
    const newMemberSocketId = getReceiverSocketId(memberId);
    if (newMemberSocketId) {
      io.to(newMemberSocketId).emit("addedToGroup", populatedGroup);
    }

    // Notify all existing members
    const memberSocketIds = group.members
      .map(member => getReceiverSocketId(member.user.toString()))
      .filter(socketId => socketId);

    memberSocketIds.forEach(socketId => {
      io.to(socketId).emit("groupUpdated", populatedGroup);
    });

    res.status(200).json(populatedGroup);
  } catch (error) {
    console.log("Error in addGroupMember controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user._id;

    // Check if user is admin or removing themselves
    const group = await Group.findOne({
      _id: groupId,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isAdmin = group.admins.includes(userId);
    const isRemovingSelf = userId.toString() === memberId;

    if (!isAdmin && !isRemovingSelf) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Remove member
    group.members = group.members.filter(member => 
      member.user.toString() !== memberId
    );

    // Remove from admins if they were admin
    group.admins = group.admins.filter(admin => 
      admin.toString() !== memberId
    );

    await group.save();

    // Notify the removed member
    const removedMemberSocketId = getReceiverSocketId(memberId);
    if (removedMemberSocketId) {
      io.to(removedMemberSocketId).emit("removedFromGroup", { groupId });
    }

    // Notify remaining members
    const memberSocketIds = group.members
      .map(member => getReceiverSocketId(member.user.toString()))
      .filter(socketId => socketId);

    const populatedGroup = await Group.findById(groupId)
      .populate('members.user', 'fullName profilePic email')
      .populate('createdBy', 'fullName profilePic email');

    memberSocketIds.forEach(socketId => {
      io.to(socketId).emit("groupUpdated", populatedGroup);
    });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.log("Error in removeGroupMember controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
