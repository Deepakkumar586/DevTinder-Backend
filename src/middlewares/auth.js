const User = require("../models/user");
const jwt = require('jsonwebtoken');
const userAuth = async (req, res, next) => {
    try {
        const cookie = req.cookies;
        const token = cookie.token;
        if (!token) {
            return res.status(401).json({
                message: "You are not Logged in, Please Login !"
            })
        }
        const decoded = jwt.verify(token, process.env.Secret_KEY);
        const { _id } = decoded;
        const finduser = await User.findById(_id);

        if (!finduser) {
            return res.status(401).json({
                message: "User not found, Unauthorized Access"
            })
        }
        req.user = finduser;
        next();

    }
    catch (err) {
        res.status(500).json({
            message: "Authentication error",
            error: err.message
        })
    }

}

module.exports = { userAuth }