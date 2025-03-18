import jwt from "jsonwebtoken";
import  { User } from "../models/user.models.js";

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

    // Decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    const admin = await User.findById(decoded.id);

    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    req.admin = admin; // Attach admin data to the request
    next();
  } catch (error) {
    return res.status(403).json({ message: "Access Denied: Invalid token" });
  }
};

