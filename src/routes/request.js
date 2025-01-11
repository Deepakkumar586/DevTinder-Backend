const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestConnectionRouter = express.Router();
const sendEmail = require("../utils/sendEmail");

// interested and ignored routes
requestConnectionRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      // Allowed statuses
      const allowedStatuses = ["interested", "ignored"];
      if (!allowedStatuses.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status", error: "Invalid status" });
      }

      // Check if connection request already exists
      const existingConnectionRequest = await ConnectionRequest.findOne({
        fromUserId: fromUserId,
        toUserId: toUserId,
      });
      if (existingConnectionRequest) {
        return res.status(409).send({
          message: "Connection request already exists",
          error: "Connection request already exists",
        });
      }

      // Check if the target user exists
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).send({
          message: "User not found in db. Cannot send connection request.",
          error: "User not found",
        });
      }

      // Create and save the connection request
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const connectionRequestData = await connectionRequest.save();

      // Prepare email subject and body
      // const subject = `Connection Request: ${status} in`;
      // const body = `Hello ${req.user.firstName},\n\nYou have sent a connection request to ${toUser.firstName}.`;

      // // Send email to the target user
      // await sendEmail(
      //   process.env.AWS_EMAIL_ADDRESS,
      //   toUser.firstName,
      //   subject,
      //   body
      // ); // sendEmail function is called here

      // const emailRes = await sendEmail.run(
      //   "You have sent a request to " + toUser.firstName, // Subject
      //   `Hello ${req.user.firstName},\n\nYou have sent a connection request to ${toUser.firstName}.\n\n${toUser.firstName} has marked you as ${status} in their connection request.` // Body
      // );

      // Respond with success
      res.status(200).json({
        message: `${req.user.firstName} is ${status} to ${toUser.firstName}`,
        connectionRequestData,
      });
    } catch (err) {
      console.error("Error:", err.message);
      res
        .status(500)
        .send({ message: "Connection send problem", error: err.message });
    }
  }
);

// accepted and rejected routes
requestConnectionRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      // allowed status | validate the status
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status in request ",
          error: "Invalid status",
        });
      }

      // check connection request are presend or not
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res.status(404).json({
          message: "Invalid request or connection request  not found",
          error: "Invalid request",
        });
      }

      // change status
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res
        .status(200)
        .json({ message: `Your request status is ${status}`, data: data });

      // virat => aryan
      // loggedinUser = touserId
      // status => interesed
      // requestId should be valid
    } catch (err) {
      console.error("Error:", err.message);
      res
        .status(500)
        .send({ message: "connection review problem", error: err.message });
    }
  }
);

module.exports = requestConnectionRouter;
