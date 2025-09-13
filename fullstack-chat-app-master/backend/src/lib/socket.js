import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      /\.onrender\.com$/, // Allow all Render subdomains
      /\.netlify\.app$/, // Allow all Netlify subdomains
    ],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

// used to store typing users
const typingUsers = {}; // {userId: {receiverId: timestamp}}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  console.log("User ID from query:", socket.handshake.query.userId);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("User socket mapped:", userId, "->", socket.id);
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle typing events
  socket.on("typing", (data) => {
    const { receiverId, isTyping } = data;
    
    if (isTyping) {
      // User started typing
      if (!typingUsers[userId]) {
        typingUsers[userId] = {};
      }
      typingUsers[userId][receiverId] = Date.now();
      
      // Notify receiver
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          userId,
          isTyping: true,
          timestamp: Date.now()
        });
      }
    } else {
      // User stopped typing
      if (typingUsers[userId] && typingUsers[userId][receiverId]) {
        delete typingUsers[userId][receiverId];
        
        // Clean up empty objects
        if (Object.keys(typingUsers[userId]).length === 0) {
          delete typingUsers[userId];
        }
        
        // Notify receiver
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("userTyping", {
            userId,
            isTyping: false,
            timestamp: Date.now()
          });
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    
    // Clean up typing status
    if (typingUsers[userId]) {
      // Notify all receivers that user stopped typing
      Object.keys(typingUsers[userId]).forEach(receiverId => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("userTyping", {
            userId,
            isTyping: false,
            timestamp: Date.now()
          });
        }
      });
      delete typingUsers[userId];
    }
    
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
