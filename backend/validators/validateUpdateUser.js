export const validateUpdateUser = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("username")
    .optional()
    .notEmpty()
    .withMessage("Username cannot be empty"),
  body("email").optional().isEmail().withMessage("Must be a valid email"),
  body("password")
    .optional()
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    .withMessage("Password must meet complexity rules"),
];

export default validateUpdateUser;
