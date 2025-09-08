import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html }) => {
  // 1. Configure transporter (uses Gmail here, but you can use any SMTP service)
  const transporter = nodemailer.createTransport({
    service: "gmail", // or: "smtp.ethereal.email" for testing
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS, // your app password (not your real Gmail password!)
    },
  });

  // 2. Define mail options
  const mailOptions = {
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  // 3. Send mail
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
