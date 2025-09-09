import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
      throw new Error("EMAIL_USER or EMAIL_PASS not set in .env");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // must be App Password
      },
    });

    const mailOptions = {
      from: `"BookStore App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    throw error;
  }
};

export default sendEmail;
