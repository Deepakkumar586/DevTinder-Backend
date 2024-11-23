const express = require("express");
const connectDb = require("./config/database");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validations");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  try {
    // Validations of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password, gender, age } = req.body;

    // encrypt the pasword
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
app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId) {
      return res.status(400).send({ message: "Please provide emailId" });
    } else if (!password) {
      return res.status(400).send({ message: "Please provide password" });
    }
    const findUser = await User.findOne({ emailId: emailId });

    if (!findUser) {
      return res.status(404).send({ message: "Invalid Credential" });
    }

    const isPasswordValid = await bcrypt.compare(password, findUser.password);

    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid Credential" });
    }

    // create a jwt token
    const token = await jwt.sign({ _id: findUser._id }, "nodeTinder", {
      expiresIn: "1d",
    });
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

// profile
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send({ message: "User profile", user });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send({ message: "An error occurred", error: err.message });
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  console.log("Sending a connection request");

  res.send(user.firstName + " " + "connection request sent");
});

// Connect to the database and run the server
connectDb()
  .then(() => {
    console.log("Database connection established");
    app.listen(8888, () => {
      console.log("server is successfully listening on port 8888...");
    });
  })
  .catch((err) => {
    console.log("Database connection error");
  });
