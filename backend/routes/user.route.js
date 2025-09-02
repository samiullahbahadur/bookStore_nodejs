import express from "express";
import authenticate from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validateUser from "../validators/validateUser.js";
import validate from "../validators/validate.js";
import validateUpdateUser from "../validators/validateUpdateUser.js";
import {
  createUser,
  getUsers,
  loginUser,
  logoutUser,
  deleteUser,
  updateUser,
} from "../controller/user.controller.js";

const router = express.Router();

router.get("/", getUsers);
router.post(
  "/auth/register",
  upload.single("photo"),
  validateUser,
  validate,
  createUser
);
router.post("/auth/login", loginUser);
router.post("/auth/logout", authenticate, logoutUser);
router.delete("/:id", deleteUser);
router.put(
  "/:id",
  upload.single("photo"),
  validateUpdateUser,
  validate,
  updateUser
);

export default router;
