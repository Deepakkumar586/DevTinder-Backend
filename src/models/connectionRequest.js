const mongoose = require('mongoose');
const User = require('./user');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['ignored', 'accepted', 'rejected', "interested"],
            message: `{values} is incorrect status type`
        },


    }
},
    { timestamps: true }


)

// connectionRequestSchema.pre('save',function(){
//     const connectionRequest = this;
//     if(connectionRequest.fromUserId.toString() === connectionRequest.toUserId.toString()){
//         throw new Error("Cannot send connection request to yourself.")
//     }

//     next();

// })

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema)