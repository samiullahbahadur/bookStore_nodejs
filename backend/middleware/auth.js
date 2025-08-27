import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { User } = db;

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized1" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded; // now req.user.id etc. is available
    const user = await User.findByPk(decoded.id);
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin, // ✅ include isAdmin
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};
export default authenticate;
