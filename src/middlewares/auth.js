const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  // read the token from the req cookies
  try {
    const cookie = req.cookies;

    const { token } = cookie;
    //  validate the token
    if (!token) {
      throw new Error("No token found");
    }
    const decodedData = await jwt.verify(token, "nodeTinder");
    const { _id } = decodedData;
    // find the user
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not Found");
    }

    // logged in user
    req.user = user
    // console.log("auth middlewaere : " + req.user)
    next();
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send({ message: "An error occurred", error: err.message });
    return;
  }
};
module.exports = { userAuth };
