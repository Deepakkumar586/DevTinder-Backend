
const User = require('../models/user');
const { validateSignupData, validateLoginData } = require('../utils/validation');
const bcrypt = require('bcrypt');
const Otp = require('../models/otp')
const transporter = require("../config/mail")
const { generateOtp } = require("../utils/generateOtp")
const crypto = require('crypto');
const contact = require('../models/contact');

exports.Signup = async (req, res) => {
  try {

    validateSignupData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        message: "Email Already in use, Please use a different email"
      })
    }

    const passwordhash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName, lastName, emailId, password: passwordhash
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      data: user
    })

  }
  catch (err) {
    res.status(500).json({
      message: "Error occurred during signup",
      error: err.message
    })
  }
}
exports.sendOtp = async (req, res) => {
  try {
    const { emailId } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (req.user && req.user.emailId !== emailId) {
      return res.status(403).json({
        message: "Access denied"
      });
    }


    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email already verified"
      });
    }


    await Otp.deleteOne({ emailId });

    const otpValue = generateOtp();
    const hashedOtp = await bcrypt.hash(otpValue, 10);

    await Otp.create({
      emailId,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await transporter.sendMail({
      to: emailId,
      subject: "Verify Your Email – Welcome to Social Sparks",
      html: `
    <div style="
      max-width:600px;
      margin:0 auto;
      padding:24px;
      font-family:Arial, sans-serif;
      background:#ffffff;
      border-radius:12px;
      box-shadow:0 4px 12px rgba(0,0,0,0.1);
    ">
      
      <h2 style="color:#ff4d6d; text-align:center; margin-bottom:10px;">
        Welcome to Social Sparks 
      </h2>

      <p style="font-size:15px; color:#333;">
        Hi there,
      </p>

      <p style="font-size:15px; color:#333;">
        You're just one step away from connecting with amazing people on 
        <b>Social Sparks</b>.
      </p>

      <p style="font-size:15px; color:#333;">
        Please use the verification code below to confirm your email address:
      </p>

      <div style="
        text-align:center;
        margin:24px 0;
      ">
        <span style="
          display:inline-block;
          font-size:28px;
          letter-spacing:6px;
          color:#ffffff;
          background:#ff4d6d;
          padding:14px 28px;
          border-radius:8px;
          font-weight:bold;
        ">
          ${otpValue}
        </span>
      </div>

      <p style="font-size:14px; color:#555;">
        This code is valid for <b>5 minutes</b>.  
        Please do not share this code with anyone.
      </p>

      <p style="font-size:14px; color:#777; margin-top:20px;">
        If you didn’t request this verification, you can safely ignore this email.
      </p>

      <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

      <p style="font-size:12px; color:#999; text-align:center;">
        © ${new Date().getFullYear()} Social Sparks · Find Your Spark 
      </p>

    </div>
  `
    });

    res.json({
      message: "OTP sent to email successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: "Error sending OTP",
      error: err.message
    });
  }
};
exports.verifyOtp = async (req, res) => {
  try {
    const { emailId, otp } = req.body;

    const otpRecord = await Otp.findOne({ emailId });
    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP expired or invalid"
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ emailId });
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    await User.updateOne(
      { emailId },
      { isEmailVerified: true }
    );

    await Otp.deleteOne({ emailId });

    res.json({
      message: "Email verified successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: "Error occurred during OTP verification",
      error: err.message
    });
  }
};

exports.Login = async (req, res) => {

  try {
    const { emailId, password } = req.body;
    validateLoginData(req);

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(404).json({
        message: "Invalid Credentials"
      })
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid Credentials"
      })
    }

    const token = user.getJWT();

    res.cookie('token', token)

    res.status(200).json({
      message: "Login successful",
      data: user
    })


  }
  catch (err) {
    res.status(500).json({
      message: "Error occurred during login",
      error: err.message
    })
  }
}

exports.ForgotPassword = async (req, res) => {
  try {
    const { emailId } = req.body;
    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(404).json({
        message: "User not found with this email"
      })
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `Click the link to reset your password:\n\n${resetLink}\n\nThis link will expire in 5 minutes.`;


    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: emailId,
      subject: "Password Reset Request for Social Sparks",
      text: message
    });

    res.status(200).json({
      message: "Password reset link sent to email"
    })
  }
  catch (error) {

    res.status(500).json({
      message: "Error occurred during password forgot process",
      error: error.message
    })
  }
}

exports.ResetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Password and Confirm Password do not match"
      })
    }

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await transporter.sendMail({
      to: user.emailId,
      subject: "Password Reset Successful for Social Sparks",
      text: "Your password has been reset successfully. If you did not perform this action, please contact our support immediately."
    });

    res.status(200).json({
      message: "Password reset successful"
    });

  }
  catch (error) {
    return res.status(500).json({
      message: "Error occurred during password reset process",
      error: error.message
    })
  }
}

exports.Logout = async (req, res) => {
  try {

    const checkToken = req.cookies.token;

    if (!checkToken) {
      return res.status(400).json({
        message: "User not logged in"
      })
    }
    res.cookie("token", null, {
      expires: new Date(0)
    })
    res.status(200).json({
      message: "Logout successfully"
    })
  }
  catch (err) {
    return res.status(500).json({
      message: "Error occurred during logout",
      error: err.message
    })
  }
}

exports.Contactus = async (req, res) => {
  try {

    const { username, useremail, usersubject, usermessage } = req.body;

    const contactdata = new contact({
      username, useremail, usersubject, usermessage
    })
    await contactdata.save();


    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: useremail,
      subject: "We’ve Received Your Message – DevTinder",
      html: `
    <p>Hi <b>${username}</b>,</p>

    <p><b>Thanks for reaching out to DevTinder!</b></p>

    <p>
      We’ve successfully received your message, and our team is already on it. 
      Whether you're here to build <b>meaningful connections</b>, 
      <b>collaborate on ideas</b>, or <b>explore opportunities</b> — 
      we’re excited to assist you.
    </p>

    <p>
      Our <b>support team</b> will review your query and get back to you as soon as possible. 
      We truly appreciate your patience while we work on providing you with the best possible response.
    </p>

    <p>
      In the meantime, feel free to continue exploring DevTinder and discover 
      <b>amazing connections</b> waiting for you.
    </p>

    <p>
      If your request is <b>urgent</b>, you can always reply to this email, and we’ll prioritize it.
    </p>

    <p>
      Warm regards,<br/>
      <b>The DevTinder Team</b><br/>
      <i>Connecting Developers, One Match at a Time</i>
    </p>
  `
    });
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: "dk146308@gmail.com",
      subject: "New Contact Form Submission – DevTinder",
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">

      <h2 style="color: #333;"> New Message Received</h2>

      <p>You have received a new message from your DevTinder contact form.</p>

      <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Name</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${username}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Email</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${useremail}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>Message</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${usermessage}</td>
        </tr>
      </table>

      <br/>

      <p style="color: #555; font-size: 14px;">
        This message was submitted via the DevTinder website contact form.
      </p>

      <hr/>

      <p style="font-size: 12px; color: gray;">
        <b>DevTinder Notification System</b>
      </p>

    </div>
  `
    });

    res.status(200).json({
      message: "Contact form submitted successfully"
    })

  }
  catch (err) {
    return res.status(500).json({
      message: "Error occurred during contact us process",
      error: err.message
    })
  }
}

