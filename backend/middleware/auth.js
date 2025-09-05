import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { User } = db;
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded:", decoded);
    const user = await User.findByPk(decoded.id);
    console.log("User found in auth:", user ? user.toJSON() : null);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
export default authenticate;
