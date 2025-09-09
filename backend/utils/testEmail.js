import "dotenv/config";
import sendEmail from "./sendEmail.js";

(async () => {
  try {
    await sendEmail({
      to: "your-email@gmail.com",
      subject: "Test Email",
      text: "This is a test from BookStore App!",
    });
    console.log("Email sent ✅");
  } catch (err) {
    console.error("Failed ❌", err);
  }
})();
