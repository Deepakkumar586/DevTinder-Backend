const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
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
      required: true,
      min: 18,
    },
    gender: {
      type: String,
      required: true,
      validate(value) {
        if (!/^(Male|Female|Other)$/i.test(value)) {
          throw new Error("Invalid gender! Must be Male, Female or Other.");
        }
      },
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
      validate(value) {
        if (value.length > 2) {
          throw new Error("Skills is not a more than 5 character");
        }
      },
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", userSchema);
