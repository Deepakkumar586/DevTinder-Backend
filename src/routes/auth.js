const express = require('express');
const authRouter = express.Router();
const { Signup,Login, Logout, sendOtp, verifyOtp, ForgotPassword, ResetPassword, DeleteAccount, Contactus } = require('../controllers/authController');
const { userAuth } = require('../middlewares/auth');

authRouter.post('/signup', Signup)
authRouter.post('/login', Login)
authRouter.post('/sendOtp',userAuth,sendOtp)
authRouter.post('/verify-otp',verifyOtp)
authRouter.post('/logout',Logout)
authRouter.post('/forgot-password', ForgotPassword);
authRouter.post('/reset-password/:resetToken', ResetPassword);
authRouter.post('/contactus', Contactus)


module.exports = authRouter;