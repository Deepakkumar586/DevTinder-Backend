const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestConnectionRouter = express.Router();

requestConnectionRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      // allowed status
      const allowedStatuses = ["interested", "ignored"];
      if (!allowedStatuses.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status", error: "Invalid status" });
      }

      // if already exist connection request
      const existingConnectionRequest = await ConnectionRequest.findOne({
        fromUserId: fromUserId,
        toUserId: toUserId,
      });
      if (existingConnectionRequest) {
        return res.status(409).send({
          message: "Connection request already exist",
          error: "Connection request already exist",
        });
      }

      //  // check same user
      //  if (fromUserId.toString() === toUserId.toString()) {
      //   return res
      //     .status(400)
      //     .send({
      //       message: "You can't send connection to yourself",
      //       error: "Invalid request",
      //     });
      // }

      // check if user exists
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).send({
          message: "User not found in db | you are not able to send connection",
          error: "User not found",
        });
      }

      // make a new instance
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      // save the connection request in the database
      const connectionRequestData = await connectionRequest.save();

      res.status(200).json({
        message:
          req.user.firstName +
          " " +
          "is" +
          " " +
          status +
          " " +
          "is" +
          " " +
          toUser.firstName,
        connectionRequestData: connectionRequestData, // added this line to return the saved data in response
      });
    } catch (err) {
      console.error("Error:", err.message);
      res
        .status(500)
        .send({ message: "connection send problem", error: err.message });
    }
  }
);

module.exports = requestConnectionRouter;
