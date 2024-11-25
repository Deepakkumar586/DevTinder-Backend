const express = require("express");
const { userAuth } = require("../middlewares/auth");

const requestConnectionRouter = express.Router();

requestConnectionRouter.post(
  "/sendConnectionRequest",
  userAuth,
  async (req, res) => {
    const user = req.user;
    console.log("Sending a connection request");

    res.send(user.firstName + " " + "connection request sent");
  }
);

module.exports = requestConnectionRouter;
