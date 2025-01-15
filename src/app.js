const express = require("express");
const connectDb = require("./config/database");
const cors = require("cors");
const dotenv = require("dotenv");

require("./utils/cronJob");

dotenv.config();

const cookieParser = require("cookie-parser");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware configuration
app.use(express.json());
app.use(cookieParser());

// All Routers
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payments");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);

const PORT = process.env.PORT;

// Connect to the database and run the server
connectDb()
  .then(() => {
    console.log("Database connection established");
    app.listen(PORT, () => {
      console.log("server is successfully listening on port 8888...");
    });
  })
  .catch((err) => {
    console.log("Database connection error");
  });
