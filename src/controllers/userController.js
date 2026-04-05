const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

exports.userRecievedConnection = async (req, res) => {
    try {

        const loggedInUser = req.user._id;

        const connectRequests = await connectionRequest.find({
            toUserId: loggedInUser,
            status: "interested"
        }).populate('fromUserId', ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'location', 'age', 'gender'])



        res.status(200).json({
            message: "Connection Requests fetched successfully",
            data: connectRequests
        })


    }
    catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        })
    }
}
exports.userConnections = async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        const connectionRequests = await connectionRequest.find({
            $or: [

                { toUserId: loggedInUser, status: "accepted" },
                { fromUserId: loggedInUser, status: "accepted" },
            ]
        }).populate('fromUserId', ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'location', 'age', 'gender']).populate('toUserId', ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'location', 'age', 'gender'])

        const data = connectionRequests.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        })



        return res.status(200).json({
            message: "User connections fetched successfully",
            data: data
        })

    }
    catch (err) {
        return res.status(500).json({
            message: "Internal Server Error while fetching user connections",
            error: err.message
        })
    }
}
exports.userFeed = async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;

        const skip = (page - 1) * limit;

        const existconnectionRequest = await connectionRequest.find({
            $or: [
                { toUserId: loggedInUser },
                { fromUserId: loggedInUser }
            ]
        }).select('toUserId fromUserId').populate('fromUserId toUserId', 'firstName lastName photoUrl')

        const hideUserFromFeed = new Set();
        existconnectionRequest.forEach((connection) => {
            hideUserFromFeed.add(connection.fromUserId._id.toString());
            hideUserFromFeed.add(connection.toUserId._id.toString());
        })

        const users = await User.find({
            _id: { $nin: Array.from(hideUserFromFeed), $ne: loggedInUser }
        })
            .select('firstName lastName photoUrl about skills location age gender').skip(skip).limit(limit);

        res.status(200).json({
            message: "User feed fetched successfully",
            data: users
        })

    }
    catch (err) {
        return res.status(500).json({
            message: "Internal Server Error while fetching user feed",
            error: err.message
        })
    }
}