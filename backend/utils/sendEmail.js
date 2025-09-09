import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Must be App Password
    },
  });

  const info = await transporter.sendMail({
    from: `"BookStore App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });

  console.log("Email sent:", info.response);
  return info;
};

export default sendEmail;
