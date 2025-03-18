import { Course } from "../models/course.models.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import cloudinary from "../config/cloudinaryConfig.js";

// Controller to add a new course
export const addCourse = async (req, res) => {
  try {
    const { title, description, difficulty, category } = req.body;

    // Upload image to Cloudinary
    let imageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url; // Get the Cloudinary URL
    }

    // Create a new course
    const newCourse = new Course({
      title,
      description,
      difficulty,
      category,
      thumbnail: imageUrl, // Save Cloudinary image URL
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ msg: "Server error" });
  }
};


// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find(); // Fetch all courses from the database
    if (!courses) {
      return res.status(404).json({ message: "No courses found." });
    }
    res.status(200).json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller to delete a course
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params; // Get courseId from the request parameters

    // Find and delete the course by ID
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ msg: "Course not found" });
    }

    // Return a success message after deletion
    res.status(200).json({ msg: "Course deleted successfully!" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Controller to update a course
export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updateData = req.body;

    // Upload new image to Cloudinary if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.thumbnail = result.secure_url; // Store Cloudinary URL
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

    if (!updatedCourse) {
      return res.status(404).json({ msg: "Course not found" });
    }

    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ msg: "Server error" });
  }
};


export const getEnrolledCourses = async (req, res) => {
  try {
    // Extract token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Extract user _id from token

    // Find user by _id
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const enrolledCourses = await Course.find({ _id: { $in: user.progress.map((course) => course.courseId) } })
      .select("_id title description thumbnail");
    

    res.status(200).json(enrolledCourses);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ error: "Error fetching enrolled courses" });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; 

    const { courseId } = req.body;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ error: "User or Course not found" });
    }

    const isAlreadyEnrolled = user.progress.some((c) => c.courseId.toString() === courseId);
    if (isAlreadyEnrolled) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    user.progress.push({
      courseId,
      completedLessons: [],
      completionPercentage: 0,
    });

    await user.save();

    res.status(200).json({ success: true, message: "Successfully enrolled in the course" });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ error: "Error enrolling in course" });
  }
};

export const getCourseById = async(req,res)=>{
  try {
    const { courseId } = req.params;

    // Find course by ID
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ message: "Server error" });
  }
}