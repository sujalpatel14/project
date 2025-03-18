import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const authCheck = async (req, res) => {
  try {
    // Get the token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, no token" });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await User.findById(decoded.id).select("-password"); // Exclude password

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Authenticated", student , authenticated: true});
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
