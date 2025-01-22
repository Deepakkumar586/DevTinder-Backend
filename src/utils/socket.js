const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");
const GroupChat = require("../models/GroupChat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId, lastName }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);
    });

    socket.on("joinGroupChat", ({ groupId, userId, firstName, lastName }) => {
      socket.join(groupId);
      console.log(`${firstName} ${lastName} joined Group: ${groupId}`);
    });
    // for group chat
    // Handle Sending Messages
    socket.on(
      "groupmessage",
      async ({ groupId, senderId, text, attachments = [] }) => {
        const messageData = {
          groupId,
          senderId,
          text,
          attachments,
          createdAt: new Date(),
        };

        // Save to DB
        try {
          const group = await GroupChat.findById(groupId);
          if (!group) {
            return socket.emit("error", { message: "Group not found" });
          }

          group.messages.push(messageData);
          await group.save();

          io.to(groupId).emit("groupMessageReceived", messageData);
        } catch (err) {
          console.error("Error sending message:", err);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );


    // Typing event
    socket.on("typing", ({ userId, targetUserId, isTyping }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      // Broadcast typing status to the other user in the room
      socket.to(roomId).emit("typing", {
        userId,
        isTyping,
      });
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + " " + text);

          const connection = await ConnectionRequest.findOne({
            $or: [
              {
                fromUserId: userId,
                toUserId: targetUserId,
                status: "accepted",
              },
              {
                fromUserId: targetUserId,
                toUserId: userId,
                status: "accepted",
              },
            ],
          });

          if (!connection) {
            return socket.emit("error", {
              message: "You are not friends. You can't send a message.",
            });
          }

          // Check if a chat already exists between these two participants
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          // If no chat exists, create a new one
          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId], // Ensure participants are set
              messages: [],
            });
          }

          // Add the new message to the chat
          chat.messages.push({
            senderId: userId, // Ensure senderId is set
            targetUserId,

            text,
            createdAt: new Date().toISOString(), // Add createdAt field
          });

          await chat.save(); // Save the updated chat

          // Emit the message to the chat room
          io.to(roomId).emit("messageReceived", {
            firstName,
            lastName,
            text,
            // createdAt: newMessage.createdAt,
            // createdAt: newMessage.createdAt, // Include createdAt in the emitted message
            // senderId: userId, // Include senderId to avoid duplication
            // senderId: userId, // Include senderId to avoid duplication
            senderId: userId,
          });
        } catch (err) {
          console.error(err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
