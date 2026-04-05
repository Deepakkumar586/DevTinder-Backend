const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    emailId:{
        type:String,
    },
    otp:{
        type:String,
    },
    expiresAt: {
        type:Date,
    }
})

module.exports = mongoose.model('Otp', OTPSchema)