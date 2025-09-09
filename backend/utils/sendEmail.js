import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // your App Password
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
    throw err; // Important: re-throw so your backend returns an error
  }
};
export default sendEmail;
