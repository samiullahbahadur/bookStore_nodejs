import dotenv from "dotenv";
dotenv.config();

import sendEmail from "./utils/sendEmail.js"; // adjust path if needed

(async () => {
  try {
    await sendEmail({
      to: "your-email@gmail.com",
      subject: "Test Email",
      text: "This is a test from BookStore backend!",
    });
    console.log("Email sent ✅");
  } catch (err) {
    console.error("Failed ❌", err);
  }
})();
