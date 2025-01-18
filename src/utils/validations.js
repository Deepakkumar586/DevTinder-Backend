const validator = require("validator");
const bcrypt = require("bcrypt");

const validateSignUpData = (req, res) => {
  // validate user data here
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Invalid first name or last name");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
  }
};

const validateProfileEditData = (req, res) => {
  // validate prfile update
  const allowedEditFields = ["photoUrl", "about", "age", "skills", "gender"];

  const { photoUrl, skills } = req.body;

  if (!validator.isURL(photoUrl)) {
    throw new Error("Invalid photoUrl");
  }

  // array of skills
  if (!skills || !Array.isArray(skills)) {
    throw new Error("Skills should be an array");
  }
  if (skills.length !== 5) {
    return res.status(400).json({
      message: "Skills must have at least 5 elements",
    });
  }

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  if (!isEditAllowed) {
    throw new Error("you wants to update invalid fields");
  }
};

const validatePassword = async (req, res) => {
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
    const isComparePassword = await bcrypt.compare(oldPassword, hashedPassword);
    if (!isComparePassword) {
      return res.status(400).json({ message: "Old password does not match." });
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

    // If all validations pass, return success
    return res
      .status(200)
      .json({ message: "Password validated successfully." });
  } catch (error) {
    console.error("Error during password validation:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports = {
  validateSignUpData,
  validateProfileEditData,
  validatePassword,
};
