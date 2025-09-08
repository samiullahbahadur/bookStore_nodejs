import express from "express";
import authenticate from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../validators/validate.js";

import {
  validateRegister,
  validateUpdate,
  validateLogin,
} from "../validators/validateUser.js";

import {
  createUser,
  getUsers,
  loginUser,
  logoutUser,
  deleteUser,
  updateUser,
  updatePassword,
  forgotPassword,
  resetPassword,
} from "../controller/user.controller.js";

const router = express.Router();

router.get("/", getUsers);
router.post(
  "/auth/register",
  upload.single("photo"),
  validate,
  validateRegister,
  createUser
);
router.post("/auth/login", validateLogin, loginUser);
router.post("/auth/logout", authenticate, logoutUser);
router.delete("/:id", authenticate, deleteUser);
router.put(
  "/:id",
  upload.single("photo"),
  validateUpdate,
  validate,
  updateUser
);
router.put(
  "/change-password",
  authenticate,

  updatePassword
);
router.put(
  "/forgot-password/",

  forgotPassword
);
router.put("/reset-password/:token", resetPassword);

export default router;
