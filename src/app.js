const express = require("express");

const app = express();

app.use("/", (err, req, res, next) => {
  if (err) {
    console.error("Error:", err);
    res.status(500).send("something went wrong");
  } else {
    res.send("are bhaii koi error nhi hhai");
  }
});

app.get("/getUserData", (req, res) => {
  // logic of DB call and get user data
  try {
    throw new Error("vgxhvgjhzsgdas");
    res.send("User Data send");
  } catch (err) {
    res.status(500).send("some error contact to support service");
  }
});

app.use("/", (err, req, res, next) => {
  if (err) {
    console.error("Error:", err);
    res.status(500).send("something went wrong");
  }
});

app.listen(8888, () => {
  console.log("server is successfully listening on port 8888...");
});
