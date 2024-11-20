const express = require("express");
const connectDb = require("./config/database");
const User = require("./models/user");

const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  // Creating a new instance of the User model
  const user = new User(req.body);

  try {
    await user.save();
    res.send({ message: "User created successfully", user });
  } catch (err) {
    // console.error("Error creating user:", err.message);
    res
      .status(500)
      .send({ message: "Error creating user", error: err.message });
  }
});

// one user find from the database

app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  console.log("User email:", userEmail);

  try {
    const user = await User.find({
      emailId: userEmail,
    });

    if (user.length > 0) {
      res.status(200).send({ message: "User successfully found", user });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send({ message: "An error occurred", error: err.message });
  }
});

app.get("/users", async (req, res) => {
  const userName = req.body.firstName;

  console.log("User Name:", userName);

  try {
    const user = await User.findOne({
      firstName: userName,
    });

    res.status(200).send({ message: "User successfully found", user });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send({ message: "An error occurred", error: err.message });
  }
});

// fead api - get all the user from the database
app.get("/feed", async (req, res) => {
  try {
    // it will get all data
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).send("error getting find all users", err.message);
  }
});

// delete api :
app.delete("/deleteUser", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete({ _id: userId });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send({ message: "User deleted successfully", user });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res
      .status(500)
      .send({ message: "Error deleting user", error: err.message });
  }
});

// update the api
app.put("/update", async (req, res) => {
  const userId = req.body.userId;
  // console.log("userId",userId);
  const data = req.body;
  // console.log("data",data);
  try {
    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
    });
    console.log("user", user);

    res.send({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Error updating user:", err.message);
    res
      .status(500)
      .send({ message: "Error updating user", error: err.message });
  }
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
