import sendEmail from "./utils/sendEmail.js";

(async () => {
  try {
    await sendEmail({
      to: "your-email@gmail.com",
      subject: "Test Email",
      text: "This is a test!",
    });
    console.log("Email sent ✅");
  } catch (err) {
    console.error("Failed ❌", err);
  }
})();
