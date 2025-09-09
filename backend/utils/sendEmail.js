import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password here
      },
    });

    await transporter.sendMail({
      from: `"BookStore App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent!");
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    throw err; // important to propagate the error
  }
};
export default sendEmail;
