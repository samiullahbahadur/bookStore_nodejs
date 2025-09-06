// // backend/validators/validateBook.js
// import { body } from "express-validator";

// export const validateBook = (mode = "create") => [
//   body("title").notEmpty().withMessage("Title is required"),
//   body("description").notEmpty().withMessage("Description is required"),
//   body("price")
//     .isFloat({ min: 0 })
//     .withMessage("Price must be a positive number"),
//   body("author").notEmpty().withMessage("Author is required"),
//   body("stock")
//     .exists()
//     .withMessage("Stock is required")
//     .isInt({ min: 1 })
//     .withMessage("Stock must be greater than 0"),

//   // ✅ Custom validation for photo
//   (req, res, next) => {
//     if (mode === "create" && !req.file) {
//       // On create: require photo
//       return res.status(400).json({ errors: [{ msg: "Photo is required" }] });
//     }
//     if (req.file) {
//       const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//       if (!allowedTypes.includes(req.file.mimetype)) {
//         return res
//           .status(400)
//           .json({ errors: [{ msg: "Only JPG or PNG images are allowed" }] });
//       }
//     }
//     next();
//   },
// ];

// export default validateBook;

import { body } from "express-validator";

export const validateBook = (mode = "create") => [
  body("title").optional({ checkFalsy: true }),
  body("description").optional({ checkFalsy: true }),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be positive"),
  body("author").optional({ checkFalsy: true }),
  body("stock")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Stock must be greater than 0"),

  (req, res, next) => {
    if (mode === "create" && !req.file) {
      return res.status(400).json({ errors: [{ msg: "Photo is required" }] });
    }
    if (req.file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Only JPG or PNG images are allowed" }] });
      }
    }
    next();
  },
];
export default validateBook;
