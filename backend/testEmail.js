import "dotenv/config";
import sendEmail from "./utils/sendEmail.js";

(async () => {
  try {
    await sendEmail({
      to: "frontansamiullaha@gmail.com",
      subject: "Test Email",
      text: "Hello! This is a test email.",
    });
    console.log("✅ Email sent successfully!");
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
})();
