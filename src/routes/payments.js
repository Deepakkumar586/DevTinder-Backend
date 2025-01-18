const express = require("express");
const { userAuth } = require("../middlewares/auth");
const razorpayInsatnce = require("../utils/razorpay");
const Payment = require("../models/payment");
const { membershipAmount } = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");
const nodemailer = require("nodemailer");

const paymentRouter = express.Router();

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;
    const order = await razorpayInsatnce.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      partial_payment: false,
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

    //   save it in my database
    console.log(order);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      // razorpayPaymentId: order.payment_id,
      // razorpaySignature: order.signature,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      notes: order.notes,
      receipt: order.receipt,
    });
    const savePayment = await payment.save();

    // Return back my orders details to Frontend
    res.json({ ...savePayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "An error occurred", error: e.message });
  }
});

// through of this api razorpay call us
paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature, // X-Razorpay-Signature
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(400).send("Invalid webhook signature");
    }

    // if webhook is vaild update my payment status in DB
    //   update the user as premium
    // return success response to razorpay webhook

    const paymentDetails = req.body.payload.payment.entity;
    const payment = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });
    payment.status = paymentDetails.status;
    await payment.save();

    // update user as premium
    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();

    if (req.body.event === "payment.captured") {
      // Send email to user about payment success using nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: user.emailId,
        subject: "Payment Successful",
        text: `Hi ${user.firstName},\n\nYour payment for ${
          payment.notes.membershipType
        } membership has been successful. You are now a ${
          payment.notes.membershipType
        } of SocialSparks. Thank you for using our platform.\nAmount: ${
          paymentDetails.amount / 100
        }\nCurrency: ${paymentDetails.currency}`,
      };

      await transporter.sendMail(mailOptions);
    }

    if (req.body.event === "payment.failed") {
      // for failed payments
      // send email to admin about failed payment using nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: process.env.ADMIN_EMAIL_ADDRESS,
        subject: "Payment Failed",
        text: `Hi Admin,\n\nA payment for ${
          payment.notes.membershipType
        } membership has failed. User details:\nName: ${user.firstName} ${
          user.lastName
        }\nEmail: ${user.emailId}\nAmount: ${
          paymentDetails.amount / 100
        }\nCurrency: ${paymentDetails.currency}`,
      };
      await transporter.sendMail(mailOptions);
    }

    return res.status(200).json({
      message: "Webhook processed successfully",
    });
  } catch (err) {
    console.error("Error in Razorpay Webhook: ", err);
    res.status(500).send("Error in Razorpay Webhook");
  }
});


paymentRouter.get("/verify-premium",userAuth,async(req,res)=>{
  const user = req.user.toJSON();
  if(user.isPremium){
    res.json({...user})
  }else{
    res.json({...user})
  }
})

module.exports = paymentRouter;
