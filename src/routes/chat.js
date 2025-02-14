const express = require("express");
const Chat = require("../models/chat");
const { userAuth } = require("../middlewares/auth");
const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;
  try {
    let chat = await Chat.findOne({
      participants: {
        $all: [userId, targetUserId],
      },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName emailId photoUrl about",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
    }
    await chat.save();
    res.status(200).json({
        message:"successfully fetched chat",
        chat
    })
    
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = chatRouter;
