const cron = require('node-cron');
const {subDays, startOfDay, endOfDay} = require('date-fns')
const ConnectionRequest = require("../models/connectionRequest");
const sendEmail = require("../utils/sendEmail");

cron.schedule("0 8 * * *", async () => {
    // Send emails to people who got requests the previous day
    try {
      const yesterday = subDays(new Date(), 1);
      const yesterdayStart = startOfDay(yesterday);
      const yesterdayEnd = endOfDay(yesterday);
  
      const pendingRequests = await ConnectionRequest.find({
        status: 'interested',
        createdAt: {
          $gte: yesterdayStart,
          $lt: yesterdayEnd
        }
      }).populate("fromUserId toUserId");
  
      // Find the unique email id
      const listOfEmails = [...new Set(pendingRequests.map(req => req.toUserId.emailId))];
  
      for (const email of listOfEmails) {
        try {
          const res = await sendEmail.run(
            `New Friend Requests pending for ${email}`,
            "There are friend requests pending. Please login to DevTinder to accept or reject the requests."
          );
          console.log(res);
        } catch (err) {
          console.error(`Error sending email to ${email}:`, err.message);
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
  