const express = require("express");

// we create instance of express.js application
const app = express();

// this funtion is know as  a request handler
app.use("/test", function (req, res) {
  res.send("Hii how r u from server...");
});

app.listen(3000, () => {
  console.log("server is successfully listening on port 3000...");
});
