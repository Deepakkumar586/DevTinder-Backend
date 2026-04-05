const mongoose = require('mongoose');
const validator = require('validator');
const contactSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    useremail:{
        type:String,
        required:true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address")
            }
        }
    },
    usersubject:{
        type:String,
        required:true,
    },
    usermessage:{
        type:String,
        required:true,
    }


})

module.exports = mongoose.model("Contact", contactSchema)