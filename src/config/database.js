const mongoose = require("mongoose");

const connectDb = async () => {
  await mongoose.connect(
    "mongodb+srv://DeepakNamasteDev:deepaknamaste@nmstedev.3jzqj.mongodb.net/devTinder"
  );
};
module.exports = connectDb;
