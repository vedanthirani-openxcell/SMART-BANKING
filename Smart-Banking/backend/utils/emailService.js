const nodemailer = require("nodemailer");

// Setup transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,      // your Gmail
    pass: process.env.EMAIL_PASS       // app password
  }
});

// Function to send email
const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });
    console.log("Email sent: ", info.messageId);
  } catch (err) {
    console.error("Error sending email: ", err);
  }
};

module.exports = sendEmail;
