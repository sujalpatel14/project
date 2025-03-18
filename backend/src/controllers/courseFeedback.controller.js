import jwt from "jsonwebtoken";
import CourseFeedback from "../models/courseFeedback.models.js";
import { User } from "../models/user.models.js";

export const submitCouersFeedback = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    // Get token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized. No token provided." });
    }

    // Verify token and extract student ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.id;

    if (!courseId || !rating) {
      return res.status(400).json({ message: "Course ID and rating are required" });
    }

    // Check if the student already submitted feedback for this course
    const existingFeedback = await CourseFeedback.findOne({ courseId, studentId });

    if (existingFeedback) {
      return res.status(400).json({ message: "You have already submitted feedback for this course" });
    }

    // Create new feedback entry
    const newFeedback = new CourseFeedback({
      courseId,
      studentId,
      rating,
      comment,
    });

    await newFeedback.save();
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const courseReviews = async(req,res)=>{
  try {
    const { courseId } = req.params;

    const reviews = await CourseFeedback.find({
      courseId,
      rating: { $gte: 3 }, // Get only ratings 3 to 5
    })
      .sort({ createdAt: -1 }) // Show latest reviews first
      .limit(5) // Limit to 5 reviews
      .populate("studentId", "name"); // Fetch student name if needed

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching course reviews:", error);
    res.status(500).json({ message: "Failed to fetch course reviews" });
  }
}
