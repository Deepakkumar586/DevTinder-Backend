require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 
const express = require('express');
const app = express();
const port = 3000;
const connectDb = require('./src/config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./src/routes/auth');
const profileRouter = require('./src/routes/profile');
const requestRouter = require('./src/routes/requests');
const userRouter = require('./src/routes/user');

const cors = require('cors')

app.use(cors(
    {
        // origin: "http://localhost:5173",
        origin: "https://dev-tinder-frontend-two-rouge.vercel.app",
        credentials: true
    }
))
app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRouter);
app.use('/api', profileRouter);
app.use('/api', requestRouter);
app.use('/api', userRouter);


connectDb()
    .then(() => {
        console.log("Database connected");
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        })
    }).catch((err) => {
        console.error("Database connection failed", err);
    })
