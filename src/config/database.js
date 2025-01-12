const mongoose = require("mongoose");
require("dotenv").config();
const connectDb = async () => {
  await mongoose.connect(
    process.env.DB_SECRET
  );
};
module.exports = connectDb;
