const express = require("express");

// we create instance of express.js application
const app = express();

app.use(
  "/user",[
  (req, res, next) => {
    // route handler
    
    console.log("route handler user 1");
    next();
    // res.send("route handler 1");
  },
  (req, res,next) => {
    // route handler
    // res.send("route handler 2");
    console.log("route handler user 2");
    next();
  },],
  (req, res,next) => {
    // route handler
    // res.send("route handler 3");
    console.log("route handler user 3");
    next();
  },
  (req, res,next) => {
    // route handler
    // res.send("route handler 4");
    console.log("route handler user 4");
    next();
  },
);

app.listen(8888, () => {
  console.log("server is successfully listening on port 3000...");
});
