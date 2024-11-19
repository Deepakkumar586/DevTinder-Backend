const express = require("express");
const { adminAuth, userAuth } = require("./middlewares/auth");

const app = express();

app.use("/admin", adminAuth);


app.get("/user",userAuth,(req,res)=>{
  res.send("user auth data")
});

app.get("/admin/getAllData", (req, res) => {
  res.send("All Data send");
});

app.get("/admin/deleteUser", (req, res) => {
  // logic of fetching all about data
  res.send("delete user");
});

app.listen(8888, () => {
  console.log("server is successfully listening on port 8888...");
});
