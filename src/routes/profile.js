const express = require("express");
const { userAuth } = require("../middlewares/auth");
const {
  validateProfileEditData,
  validatePassword,
} = require("../utils/validations");
const bcrypt = require("bcrypt");
const validator = require("validator");

const profileRouter = express.Router();

// profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send({ message: "User profile", user });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send({ message: "An error occurred", error: err.message });
  }
});

// profile edit
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateProfileEditData(req);

    const loggedInUser = req.user;
    // console.log("profile edit logged in user" + loggedInUser);

    // update profile
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    // console.log("After updating profile : " + loggedInUser);

    // save updateuser
    const updatedUser = await loggedInUser.save();

    // reponse
    res.status(200).json({
      message: `${loggedInUser.firstName}, Your Profile updates Successfully`,
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send({ message: "Profile edit Error", error: err.message });
  }
});

// profile update reset password

profileRouter.patch(
  "/profile/resetPassword",
  userAuth,
  userAuth,
  async (req, res) => {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;

      // Ensure all fields are provided
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required." });
      }

      // Get the logged-in user's password hash
      const loggedInUser = req.user;
      if (!loggedInUser || !loggedInUser.password) {
        return res.status(401).json({ message: "User is not authenticated." });
      }

      const hashedPassword = loggedInUser.password;

      // Compare the old password with the stored hashed password
      const isComparePassword = await bcrypt.compare(
        oldPassword,
        hashedPassword
      );
      if (!isComparePassword) {
        return res
          .status(400)
          .json({ message: "Old password does not match." });
      }

      // Validate the strength of the new password
      if (!validator.isStrongPassword(newPassword)) {
        return res.status(400).json({
          message:
            "New password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        });
      }

      // Ensure the new password matches the confirmation password
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match." });
      }

      // save the new password to db
      loggedInUser.password = await bcrypt.hash(newPassword, 10);
      await loggedInUser.save();

      // If all validations pass, return success
      return res.status(200).json({ message: "Password Reset successfully." });
    } catch (error) {
      console.error("Error during password validation:", error);
      return res.status(500).json({ message: "Internal Server Error." });
    }
  }
);

module.exports = profileRouter;
