import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { OTP } from "../models/otp.models.js";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/email.js";
import { Course } from "../models/course.models.js";

//  Generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

//  Send OTP for email
export const sendOTP = async (req, res) => {
  const { email, type } = req.body;

  try {
    // Check if the user exists
    const existingUser = await User.findOne({ email });

    if (type === "verify") {
      // Registration: Prevent sending OTP if the user already exists
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email already registered" });
      }
    } else if (type === "forget") {
      // Forgot Password: Prevent sending OTP if user does NOT exist
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP type" });
    }

    // Generate and save OTP
    const otp = generateOTP();
    const otpEntry = new OTP({ email, otp, createdAt: new Date() });
    await otpEntry.save();

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error sending OTP", error });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // OTP is valid, delete OTP from database
    await OTP.deleteOne({ email });

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "OTP verification failed", error });
  }
};

export const registerUser = async (req, res) => {
  const { email, name, password } = req.body;
  const role = "Student";
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const newUser = new User({ email, name, password, role });
    await newUser.save();

    res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.password = password;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error resetting password", error });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find student by email
    const student = await User.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token in a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const profile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const student = await User.findById(decoded.id)
      .select("-password")
      .populate({
        path: "progress.courseId", // ✅ Populating courseId inside progress
        model: Course,
        select: "title", // ✅ Fetching only course title
      });

    if (!student) return res.status(404).json({ message: "User not found" });

    res.json(student);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfilePic = async (req, res) => {
  try {
    // Extract JWT token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verify JWT and extract student ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.id; // Extract student ID from token

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profilePicUrl = req.file.path; // Cloudinary provides a URL

    const student = await User.findByIdAndUpdate(
      studentId,
      { profilePic: profilePicUrl },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePic: student.profilePic,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStudentProfilePic = async (req, res) => {
  try {
    // Extract JWT token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verify JWT and extract student ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.id; // Extract student ID from token

    const student = await User.findById(studentId).select("profilePic"); // Fetch only profilePic

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ profilePic: student.profilePic });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const studentProgress = async (req, res) => {
  const search = req.query.search;


  if (!search) {
    return res.status(400).json({ error: "Search term is required." });
  }

  try {
    const student = await User.findOne({email:search});

    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    // If student is found, then populate progress.courseId
    const studentWithProgress = await User.findOne({
      _id: student._id,
    }).populate({
      path: "progress.courseId",
      select: "title description lessons", // Include lessons field from Course
      populate: {
        path: "lessons",
        select: "title", // Get only lesson titles
      },
    }).populate({
      path: "progress.completedLessons", // Populate completedLessons inside progress
      select: "title", // Get only lesson titles instead of IDs
    });
    res.json(studentWithProgress);
  } catch (error) {
    console.error("Error fetching student progress:", error);
    res.status(500).json({ error: "Server error." });
  }
};
