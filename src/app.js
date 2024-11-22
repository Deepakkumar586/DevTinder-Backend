const express = require("express");
const connectDb = require("./config/database");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validations");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

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
app.post('/login', async (req, res)=> {
      try{
        const {emailId, password} = req.body;

        if(!emailId){
          return res.status(400).send({ message: "Please provide emailId" });
        }
        else if(!password){
          return res.status(400).send({ message: "Please provide password" });
        }
        const findUser = await User.findOne({emailId: emailId})

        if(!findUser){
          return res.status(404).send({ message: "Invalid Credential" });
        }

        const isPasswordValid = await  bcrypt.compare(password, findUser.password)

        if(!isPasswordValid){
          return res.status(400).send({ message: "Invalid Credential" });
        }

        res.send({ message: "Login successful", user: findUser });


      }
      catch(err){
        console.error("Error:", err.message);
        res.status(500).send({ message: "we are not able to login  ", error: err.message });
      }
})

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
app.patch("/update/:userId", async (req, res) => {
  const userId = req.params?.userId;
  // console.log("userId",userId);
  const data = req.body;
  // console.log("data",data);

  try {
    // ALLOWED UPDATES
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

    // "age":18,
    // "emailId":"deepak@gmail.com"
    // "gender":"male",
    // "skills":["javascript","node.js","rreact.js","python"]
    const isUpdateAllowed = Object.keys(data).every((key) =>
      ALLOWED_UPDATES.includes(key)
    );

    if (!isUpdateAllowed) {
      throw new Error("update not allowed");
    }
    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
      runValidators: true,
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
