import dotenv from "dotenv";
dotenv.config();
import sendEmail from "./utils/sendEmail.js";

(async () => {
  try {
    await sendEmail({
      to: "your-email@gmail.com", // test recipient
      subject: "Test Email",
      text: "This is a test from Node.js",
    });
  } catch (err) {
    console.error(err);
  }
})();
