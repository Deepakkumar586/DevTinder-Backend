const express = require("express");
const Grouprouter = express.Router();
const GroupChat = require("../models/GroupChat");
const { userAuth } = require("../middlewares/auth"); // Authentication middleware

// Create a new group
Grouprouter.post("/create/Group", userAuth, async (req, res) => {
  const { name, description } = req.body;

  const userId = req.user._id;

  try {
    // Create the group with the authenticated user as the admin
    const group = new GroupChat({
      name,
      description,
      members: [{ userId, role: "admin" }],
      createdBy: userId,
    });

    // check exist group according to this name of group
    const existGroup = await GroupChat.findOne({ name });
    if (existGroup) {
      return res.status(409).json({
        success: false,
        message: "Group name already exists",
      });
    }

    // Save the group to the database
    await group.save();

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to create group",
      details: err.message,
    });
  }
});

// Get all groups for a user
Grouprouter.get("/check/all-groups", userAuth, async (req, res) => {
  const userId = req.user._id;
  try {
    const groups = await GroupChat.find({
      "members.userId": userId,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "members.userId",
        select: "firstName lastName ",
      })
      .populate({
        path: "createdBy",
        select: "firstName lastName ",
      });

    res.status(200).json({
      success: true,
      message: "Fetched groups successfully",
      groups,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch groups",
      details: err.message,
    });
  }
});

// Get a single group by ID
Grouprouter.get("/check/group-by-Id/:groupId", userAuth, async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  try {
    const group = await GroupChat.findById(groupId)
      .populate({
        path: "members.userId",
        select: "firstName lastName about photoUrl role",
      })
      .populate({
        path: "createdBy",
        select: "firstName lastName about photoUrl",
      });

    if (!group) {
      return res.status(404).json({
        success: false,
        error: "Group not found with the provided ID",
      });
    }

    // Check authorization
    const isAuthorized = group.members.some(
      (member) =>
        member.userId &&
        member.userId._id.toString() === userId.toString() &&
        (member.role === "member" || member.role === "admin")
    );

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You are not a member of this group.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Group details fetched successfully",
      group,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch group details",
      details: err.message,
    });
  }
});

// Fetch all messages from a group
Grouprouter.get("/group-messages/:groupId", async (req, res) => {
  try {
    const groupChat = await GroupChat.findById(req.params.groupId).populate(
      "messages.senderId"
    );
    if (!groupChat) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.status(200).json({ messages: groupChat.messages });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch group messages." });
  }
});

// Add a member to the group
Grouprouter.post("/add/Member/InGroup/:userId", userAuth, async (req, res) => {
  const { groupName } = req.body; // Get group name from the body
  const userId = req.params.userId; // Get userId from the route params
  const loggedInUser = req.user._id;

  try {
    // Find the group by group name instead of groupId
    const group = await GroupChat.findOne({ name: groupName });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Ensure user is an admin
    const isAdmin = group.members.some(
      (member) =>
        member.userId.toString() === loggedInUser.toString() &&
        member.role === "admin"
    );
    if (!isAdmin) {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    // Add member if not already in the group
    const isMember = group.members.some(
      (member) => member.userId.toString() === userId
    );
    if (isMember) {
      return res
        .status(400)
        .json({ error: "User is already a member of the group" });
    }

    group.members.push({ userId, role: "member" });
    await group.save();

    res.status(200).json({
      message: "Member added successfully",
      group,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to add member", details: err.message });
  }
});

// Remove a member from the group
Grouprouter.delete(
  "/remove-member/from-group/:groupId",
  userAuth,
  async (req, res) => {
    const { userId } = req.body;
    const groupId = req.params.groupId;

    try {
      const group = await GroupChat.findById(groupId);

      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      // Ensure user is an admin
      const isAdmin = group.members.some(
        (member) =>
          member.userId.toString() === req.user.id && member.role === "admin"
      );
      if (!isAdmin) {
        return res
          .status(403)
          .json({ error: "Only admins can remove members" });
      }

      // Remove member
      group.members = group.members.filter(
        (member) => member.userId.toString() !== userId
      );
      await group.save();

      res.status(200).json({
        message: "Member removed successfully",
        group,
      });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to remove member", details: err.message });
    }
  }
);
// Delete a group
Grouprouter.delete("/remove/group/:groupId", userAuth, async (req, res) => {
  const groupId = req.params.groupId;
  const loggedInUser = req.user._id;
  try {
    const group = await GroupChat.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Ensure user is the group creator
    if (group.createdBy.toString() !== loggedInUser.toString()) {
      return res
        .status(403)
        .json({ error: "Only the creator can delete the group" });
    }

    await group.deleteOne();
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete group", details: err.message });
  }
});

module.exports = Grouprouter;
