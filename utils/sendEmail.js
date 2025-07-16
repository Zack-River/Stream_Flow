const nodemailer = require('nodemailer');

exports.sendEmail = async function (receiver , subject, message) {
  try {
    if (!receiver) throw new Error('No receiver defined!');
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: receiver,
      subject: subject,
      html: message
    });
  } catch (err) {
    console.error(err);
  }
};
