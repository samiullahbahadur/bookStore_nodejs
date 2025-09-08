import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log(
    "EMAIL_PASS:",
    process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌"
  );

  try {
    // 🔹 Ensure env variables are loaded
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS is missing in .env");
    }

    console.log("Sending email from:", process.env.EMAIL_USER);

    // 🔹 Create transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // must be App Password if 2FA is enabled
      },
    });

    // 🔹 Email options
    const mailOptions = {
      from: `"BookStore App" <${process.env.EMAIL_USER}>`, // MUST match EMAIL_USER
      to,
      subject,
      text,
    };

    // 🔹 Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Email sending error:", error);
    if (error.responseCode === 535) {
      console.error(
        "❗ Invalid login. Make sure you are using the Gmail App Password if 2FA is enabled."
      );
    }
    throw error;
  }
};

export default sendEmail;
