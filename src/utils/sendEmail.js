const AWS = require("aws-sdk");
require("dotenv").config();

// SES Configuration
const SES_Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: "ap-south-1",
};

const AWS_SES = new AWS.SES(SES_Config);

// Send Email Function
const sendEmail = async (recipientEmail, name, subject, body) => {
    const params = {
      Source: process.env.AWS_EMAIL_ADDRESS, // Make sure this email is verified in AWS SES
      Destination: { ToAddresses: [recipientEmail] },
      Message: {
        Body: {
          Html: { Data: `<h1>${body}</h1>` }, // Dynamically setting the body
          Text: { Data: body }, // Text format body
        },
        Subject: { Data: `${subject}, ${name}` }, // Including name in the subject
      },
    };
  
    try {
      const result = await AWS_SES.sendEmail(params).promise();
      return result; // Return the result if needed in the route handler
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  };
  
  

// Export the sendEmail function
module.exports = sendEmail;
