const nodemailer = require('nodemailer');
require('dotenv').config(); 

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });

    // console.log(' Email sent successfully');
  } catch (error) {
    console.error(' Email send failed:', error);
  }
};

module.exports = sendEmail;
