import { body } from "express-validator";

// Password regex
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const validateChangePassword = [
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword")
    .matches(passwordRegex)
    .withMessage(
      "Password must be at least 8 characters, include a letter, number, and special symbol"
    ),
];

export default validateChangePassword;
