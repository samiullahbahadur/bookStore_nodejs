import db from "../models/index.js";
import fs from "fs";
import path from "path";
import { generateToken, generateResetToken } from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

import bcrypt from "bcrypt";
const { User } = db;
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(201).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "DB error",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const photo = req.file ? req.file.path : null;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = await User.create({
      name,
      username,
      email,

      password,
      photo,
    });

    const token = generateToken(newUser);
    newUser.token = token;
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      newUser: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatchPWD = await bcrypt.compare(password, user.password);
    if (!isMatchPWD) {
      return res.status(401).json({ message: "Invalid credential" });
    }
    const token = generateToken(user);
    user.token = token;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      user: {
        id: user.id,
        name: user.name,
        username: user.username, // ✅ include
        email: user.email,
        photo: user.photo, // ✅ include
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(404).json({ message: "Unauthorized" });

    const user = await User.findByPk(userId);

    user.token = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.photo) {
      const imagePath = path.join("uploads", path.basename(user.photo));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await user.destroy();
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, username, email } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Handle photo upload & remove old photo if exists
    if (req.file) {
      if (user.photo) {
        const oldPath = path.join("uploads", path.basename(user.photo));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // Remove old image
        }
      }
      user.photo = req.file.filename;
    }

    // Update only provided fields
    if (name) user.name = name;
    if (username) user.username = username;
    if (email) user.email = email;
    // if (password) user.password = password;

    await user.save();

    // Send back the **full updated user object (minus password)**
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        photo: user.photo,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Old password is incorrect" });

    user.password = newPassword; // will be hashed automatically by beforeUpdate hook
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ error: error.message });
  }
};

// import sendEmail from "../utils/sendEmail.js"; // your email utility

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Generate a secure reset token
    const token = generateResetToken(user);
    user.token = token;
    await user.save();

    // Build frontend reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Send the reset email
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      text: `Hello ${
        user.name || ""
      },\n\nClick this link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    });

    res.status(200).json({
      success: true,
      message: "Reset password email sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword)
      return res.status(400).json({ message: "New password is required" });

    const user = await User.findOne({ where: { token } });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    // Update password and remove token
    user.password = newPassword;
    user.token = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: err.message });
  }
};
