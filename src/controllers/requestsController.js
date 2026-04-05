// request controller file

const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

exports.sendConnectionRequest = async (req, res) => {
    try {
        const toUserId = req.params.toUserId;
        const toUser = await User.findById(toUserId);

        if (!toUser) {
            return res.status(404).json({
                message: "The user you are trying to connect with does not exist."
            })
        }

        const fromUserId = req.user._id;
        const status = req.params.status;

        const allowedstatus = ['ignored', 'interested'];
        if (!allowedstatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status type. Allowed types are 'ignored' and 'interested'."
            })
        }

        const existingRequest = await connectionRequest.findOne({
            $or: [{
                fromUserId,
                toUserId
            },
            {
                fromUserId: toUserId,
                toUserId: fromUserId
            }]
        });

        if (existingRequest) {
            return res.status(400).json({
                message: "A connection request already exists."
            })
        }

        const sendconnectionRequest = new connectionRequest({
            fromUserId,
            toUserId,
            status

        })
         if(sendconnectionRequest.fromUserId.toString() === sendconnectionRequest.toUserId.toString()){
        throw new Error("Cannot send connection request to yourself.")
    }
        await sendconnectionRequest.save();

        return res.json({
           
            message: `Connection request has been sent with status '${status}' to ${toUser.firstName} ${toUser.lastName}.`,
            data: sendconnectionRequest
        })

    } catch (err) {
        return res.status(500).json({
            message: "Error occurred while sending connection request",
            error: err.message
        })
    }
}

exports.reviewConnectionRequest = async (req, res) => {
    try{
        const requestId = req.params.requestId;
        const status = req.params.status;
        const allowedstatus = ['accepted', 'rejected'];
        if (!allowedstatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status type. Allowed types are 'accepted' and 'rejected'."
            })
        }

        const loggedInUserId = req.user._id;

        const connectionReq = await connectionRequest.findOne({
            _id:requestId,
            toUserId:loggedInUserId,
            status: 'interested'
        },
        { new: true }
    
    );

        if (!connectionReq) {
            return res.status(404).json({
                message: "No pending connection request found with the provided ID for you."
            })
        }



        connectionReq.status = status;
        await connectionReq.save();

        return res.json({
            message: `Connection request has been ${status}.`,
            data: connectionReq
        })

    }
    catch(err){
        return res.status(500).json({
            message: "Error occurred while reviewing connection request",
            error: err.message
        })
    }
}