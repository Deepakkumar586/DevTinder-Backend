const express = require("express");
const { validateSignUpData } = require("../utils/validations");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

// signup api
authRouter.post("/signup", async (req, res) => {
  try {
    // Validations of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password, gender, age } = req.body;

    // encrypt the password to attacker
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword", hashedPassword);

    // Creating a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      gender,
      age,
    });

    await user.save();
    res.send({ message: "User created successfully", user });
  } catch (err) {
    // console.error("Error creating user:", err.message);
    res
      .status(500)
      .send({ message: "Error creating user", error: err.message });
  }
});

// Login api
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId) {
      return res.status(400).send({ message: "Please provide emailId" });
    } else if (!password) {
      return res.status(400).send({ message: "Please provide password" });
    }

    // find the user by email
    const findUser = await User.findOne({ emailId: emailId });

    if (!findUser) {
      return res.status(404).send({ message: "Invalid Credential" });
    }

    const isPasswordValid = await findUser.validatePassword(password);

    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid Credential" });
    }

    // create a jwt token
    const token = await findUser.getJWT();
    console.log("Token created", token);

    // add token to cookie and send the response back to user
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
    });
    res.send({ message: "Login successful", user: findUser });
  } catch (err) {
    console.error("Error:", err.message);
    res
      .status(500)
      .send({ message: "we are not able to login  ", error: err.message });
  }
});

// logout api
authRouter.post("/logout", async (req,res)=>{
  try {

    // first method
    res.cookie("token",null,{
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    res.send({ message: "Logged out successfully" });

    // second method 
    // res.clearCookie("token");
    // res.send({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Error:", err.message);
    res
     .status(500)
     .send({ message: "An error occurred", error: err.message });
  }

})



module.exports = authRouter;
