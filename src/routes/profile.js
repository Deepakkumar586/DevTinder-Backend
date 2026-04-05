const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const { Profile, UpdateProfile } = require('../controllers/profileController');

profileRouter.get("/profile", userAuth, Profile)
profileRouter.patch("/update/profile",userAuth,UpdateProfile)

module.exports = profileRouter;