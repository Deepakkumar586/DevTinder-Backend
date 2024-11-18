const express = require("express");

// we create instance of express.js application
const app = express();

// this will only handle GET call to /user
app.get("/user/:userId/:name/:password", (req, res) => {
  console.log("params:", req.params)
  res.send({ firstName: "Deepak", lastName: "Kumar" });
});

app.listen(3000, () => {
  console.log("server is successfully listening on port 3000...");
});
