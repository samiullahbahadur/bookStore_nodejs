import { body } from "express-validator";

// Password regex
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Register
export const validateRegister = [
  body("name").notEmpty().withMessage("Name is required"),
  body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .matches(passwordRegex)
    .withMessage(
      "Password must be at least 8 characters, include a letter, number, and special symbol"
    ),
  // photo optional
];

// Login
export const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Update (email/password/photo optional)
export const validateUpdate = [
  body("name").optional().notEmpty().withMessage("Name is required"),
  body("username").optional().notEmpty().withMessage("Username is required"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("password")
    .optional()
    .matches(passwordRegex)
    .withMessage(
      "Password must be at least 8 characters, include a letter, number, and special symbol"
    ),
  // photo optional
];

export default { validateRegister, validateLogin, validateUpdate };
