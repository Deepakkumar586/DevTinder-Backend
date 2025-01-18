const express = require("express");
const { userAuth } = require("../middlewares/auth");
const {
  validateProfileEditData,
  validatePassword,
} = require("../utils/validations");
const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
// const user = require("../models/user");

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

// /profile delete

profileRouter.delete("/profile/delete", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    // remove user from database
    console.log("id" + loggedInUser);

    await User.findByIdAndDelete(loggedInUser);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error:", err.message);
    res
      .status(500)
      .send({ message: "Profile delete Error", error: err.message });
  }
});

// profile forgot password via mail
profileRouter.post("/profile/forgotPassword", async (req, res) => {
  try {
    const { emailId } = req.body;

    // Find user with the provided email
    const findUser = await User.findOne({ emailId });

    if (!findUser) {
      return res
        .status(404)
        .json({ message: "Email not found.", success: false });
    }

    // Check if the user recently requested a reset email
    const currentTime = new Date();
    const resetRequestCooldown = 10 * 60 * 1000; // 10 minutes in milliseconds

    if (findUser.lastPasswordResetRequest) {
      const timeSinceLastRequest =
        currentTime - new Date(findUser.lastPasswordResetRequest);
      if (timeSinceLastRequest < resetRequestCooldown) {
        const timeRemaining = Math.ceil(
          (resetRequestCooldown - timeSinceLastRequest) / 60000
        );
        return res.status(429).json({
          message: `You can request another reset email in ${timeRemaining} minutes.`,
          success: false,
        });
      }
    }

    // Generate the token for password reset (expires in 10 minutes)
    const resetToken = jwt.sign({ id: findUser._id }, "nodeTinder", {
      expiresIn: "10m",
    });

    // Define frontend URL (can be overridden by environment variable)
    const frontendUrl = "http://51.20.82.159/api";

    // URL encoding for the reset password link
    const resetPasswordLink = encodeURI(
      `${frontendUrl}/reset-password/${findUser._id}/${resetToken}`
    );

    // Setup Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_ADDRESS, // Replace with your Gmail email
        pass: process.env.EMAIL_PASSWORD, // Replace with your Gmail App Password
      },
    });

    // Mail options to send email
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS, // Replace with your Gmail email
      to: emailId, // User's email address
      subject: "Password Reset Token (valid for only 10 minutes)",
      html: `
        <p>You can reset your password by clicking the button below:</p>
        <a href="${resetPasswordLink}" style="
            display: inline-block;
            background-color: #007BFF;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
        ">Reset Password</a>
        <p>If you can't click the button, please copy and paste the following URL into your browser:</p>
        <p><a href="${resetPasswordLink}">${resetPasswordLink}</a></p>
        <p>If you remember your password, please ignore this email.</p>
      `,
    };

    // Send the email
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.log("Error sending email: " + error);
        return res
          .status(500)
          .json({ message: "Failed to send password reset email." });
      } else {
        console.log("Email sent: " + info.response);

        // Update the user's last password reset request time
        findUser.lastPasswordResetRequest = currentTime;
        await findUser.save();

        return res.status(200).json({
          message: "Password reset email sent successfully.",
        });
      }
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
});

// profile update reset password
profileRouter.post("/profile/resetPassword/:id/:token", async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password, confirmPassword } = req.body;

    // validate password
    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and Confirm Password are required." });
    }

    // match password and confirm password
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and Confirm Password do not match." });
    }

    // Validate the strength of the new password
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "New password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    // Find user with the provided id
    const findUser = await User.findById(id);

    if (!findUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify the token
    const payload = jwt.verify(token, "nodeTinder");

    if (!payload) {
      return res.status(401).json({ message: "Invalid token." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    findUser.password = hashedPassword;

    // Save the updated user
    const updatedUser = await findUser.save();

    // Return a success message
    res.status(200).json({ message: "Password updated successfully." });

    // Send a success email to the user
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_ADDRESS, // Replace with your Gmail email
        pass: process.env.EMAIL_PASSWORD, // Replace with your Gmail App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS, // Replace with your Gmail email
      to: findUser.emailId, // User's email address
      subject: "Password Update Successful",
      html: `
        <p>Your password has been updated successfully.</p>
      `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending email: " + error);
        return res
          .status(500)
          .json({ message: "Failed to send password update email." });
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    return res.status(500).json({ message: "Error! From Password Reset " });
  }
});

module.exports = profileRouter;
