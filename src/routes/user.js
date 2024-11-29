const express = require("express");
const { userAuth } = require("../middlewares/auth");
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const userRouter = express.Router();

// get all the pending connections request for the logged in user
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    // get the logged in user
    const loggedInUser = req.user;

    const findConnectionsRequest = await connectionRequest
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate({
        path: "fromUserId",
        select: "firstName lastName photoUrl about skills",
      });

    res.json({
      message: "All request fetch successfully",
      data: findConnectionsRequest,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send({
      message: "fetching all request of user Problem",
      error: err.message,
    });
  }
});

//  connection request
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await connectionRequest
      .find({
        $or: [
          { fromUserId: loggedInUser._id, status: "accepted" },
          { toUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate({
        path: "fromUserId",
        select: "firstName lastName photoUrl about skills",
      })
      .populate({
        path: "toUserId",
        select: "firstName lastName photoUrl about skills",
      });

    const data = connections.map((row) => {
      // if(row.fromUserId.firstName === loggedInUser.firstName){
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      } else {
        return row.fromUserId;
      }
    });

    res.json({
      message: `${loggedInUser.firstName} connections fetched successfully`,
      data: data,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send({
      message: "Error in fetching connections",
      error: err.message,
    });
  }
});

// feed api
userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    //  user should see all the users card except :
    // his own card
    // his connections card
    // ignored people
    // already sent the connection request

    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // find all connection request which we sent or recieve
    const sentAndReceivedConnections = await connectionRequest
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .select("fromUserId toUserId");

    const hideUserFromFeed = new Set();

    sentAndReceivedConnections.forEach((connection) => {
      hideUserFromFeed.add(connection.fromUserId._id);
      hideUserFromFeed.add(connection.toUserId._id);
    });
    console.log(hideUserFromFeed);

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select("firstName lastName photoUrl about skills")
      .skip(skip)
      .limit(limit);

    console.log(users);

    res.json({
      message: "Feed fetched successfully",
      data: users,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send({ message: "Feed Api Error", error: err.message });
  }
});

module.exports = userRouter;
