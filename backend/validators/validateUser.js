// import { body } from "express-validator";
// import { defaultValueSchemable } from "sequelize/lib/utils";

// export const validateUser = (mode = "register") => {
//   const validations = [
//     body("name").notEmpty().withMessage("Name is required"),
//     body("username").notEmpty().withMessage("Username is required"),
//   ];

//   if (mode === "register") {
//     validations.push(
//       body("email").isEmail().withMessage("Valid email is required"),
//       body("password")
//         .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
//         .withMessage(
//           "Password must be at least 8 characters, include a letter, number, and special symbol"
//         )
//     );
//   } else if (mode === "update") {
//     // Email & password optional
//     validations.push(
//       body("email")
//         .optional({ checkFalsy: true })
//         .isEmail()
//         .withMessage("Valid email is required"),
//       body("password")
//         .optional({ checkFalsy: true })
//         .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
//         .withMessage(
//           "Password must be at least 8 characters, include a letter, number, and special symbol"
//         )
//     );
//   }

//   return validations;
// };

// export default validateUser;

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
  body("name").notEmpty().withMessage("Name is required"),
  body("username").notEmpty().withMessage("Username is required"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("password")
    .optional()
    .matches(passwordRegex)
    .withMessage(
      "Password must be at least 8 characters, include a letter, number, and special symbol"
    ),
  // photo optional
];
