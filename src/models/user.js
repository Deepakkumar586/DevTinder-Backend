const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 4,
            maxLength: 40,
        },
        lastName: {
            type: String,
            minLength: 4,
            maxLength: 40,
        },
        emailId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,

        },
        password: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            min: 18,
            max: 50,
        },
        gender: {
            type: String,
            validate(value) {
                if (!["male", "female", "others"].includes(value.toLowerCase())) {
                    throw new Error("Gender must be male, female or others");
                }
            }
        },
        photoUrl: {
            type: String,
            default: "https://static.vecteezy.com/system/resources/previews/045/944/199/non_2x/male-default-placeholder-avatar-profile-gray-picture-isolated-on-background-man-silhouette-picture-for-user-profile-in-social-media-forum-chat-greyscale-illustration-vector.jpg",
            validate(value) {
                if (!validator.isURL(value)) {
                    throw new Error("Invalid URL for photoUrl")
                }
            }
        },
        about: {
            type: String,
            default: "this user prefers to keep an air of mystery about them."
        },
        skills: {
            type: [String],
            //  value max
                validate: {
                    validator: function (value) {
                        return value.length <= 5;
                    },
                    message: "A maximum of 5 skills are allowed"
                }

        },
        location: {
            type: String,
            maxLength: 50,

        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        resetPasswordToken:String,
        resetPasswordExpires:Date

      
       
    },
    { timestamps: true }


);

userSchema.methods.getJWT = function () {
    const token = jwt.sign({ _id: this._id }, process.env.Secret_KEY, { expiresIn: '1h' })
    return token;
}

userSchema.methods.validatePassword = async function (userpassword) {
    const isPasswordValid = await bcrypt.compare(userpassword, this.password);
    return isPasswordValid;
}

const User = mongoose.model('User', userSchema);

module.exports = User;