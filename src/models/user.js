const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      index: true,
      minLength: 4,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      // match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      // validate(value){
      //   if(!validator.isEmail(value)){
      //     throw new Error("Invalid email address");
      //   }

      // }
    },
    password: {
      type: String,
      required: true,
      // validate(value){
      //   if(!validator.isStrongPassword(value)){
      //     throw new Error("Password should be at least 8 characters long!");
      //   }
      // }
      // minlength: 8,
      // maxlength: 20,
    },
    age: {
      type: Number,
      // required: true,
      min: 18,
    },
    gender: {
      type: String,
      // required: true,
      validate(value) {
        if (!/^(Male|Female|Other)$/i.test(value)) {
          throw new Error("Invalid gender! Must be Male, Female or Other.");
        }
      },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
    },
    photoUrl: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid photo URL!");
        }
      },
      default:
        "https://static.vecteezy.com/system/resources/previews/045/944/199/non_2x/male-default-placeholder-avatar-profile-gray-picture-isolated-on-background-man-silhouette-picture-for-user-profile-in-social-media-forum-chat-greyscale-illustration-vector.jpg", // default photo url
    },
    about: {
      type: String,
      default: "This is a default about of the user!",
    },
    skills: {
      type: [String],
      // required: true,
    },
    lastPasswordResetRequest: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// compound index
userSchema.index({ firstName: 1, lastName: 1 });

// create a token here
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });

  return token;
};

// validation password
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const hashedPassword = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    hashedPassword
  );
  return isPasswordValid;
};
module.exports = mongoose.model("User", userSchema);
