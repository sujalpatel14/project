import { User } from "../models/user.models.js";
import { Course } from "../models/course.models.js";
import { Progress } from "../models/progress.models.js";
import { Quiz } from "../models/quiz.models.js";
import mongoose from "mongoose";
import { Lesson } from "../models/lesson.models.js";

export const userData = async (req, res) => {
    try {
        // Count users directly in MongoDB
        const studentsCount = await User.countDocuments({ role: "Student" });
        const adminsCount = await User.countDocuments({ role: "Admin" });

        // Sending response in chart-friendly format
        res.json({
            labels: ["Students", "Admins"],
            datasets: [
                {
                    data: [studentsCount, adminsCount],
                    backgroundColor: ["#36A2EB", "#FF6384"],
                },
            ],
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Error fetching user data" });
    }
};

  

// Fetch courses by difficulty level
export const courseDifficulty = async (req, res) => {
    try {
      // Debug: Fetch all courses
      const allCourses = await Course.find();

      // Check distinct values of `difficulty` (not `difficultyLevel`)
      const difficultyValues = await Course.distinct("difficulty");
  
      //Use the correct field name: `difficulty`
      const beginnerCount = await Course.countDocuments({ difficulty: "Beginner" });
      const intermediateCount = await Course.countDocuments({ difficulty: "Intermediate" });
      const advancedCount = await Course.countDocuments({ difficulty: "Advanced" });

  
      res.json({
        labels: ["Beginner", "Intermediate", "Advanced"],
        datasets: [
          {
            label: "Courses by Difficulty",
            data: [beginnerCount, intermediateCount, advancedCount],
            backgroundColor: ["#4BC0C0", "#FF9F40", "#9966FF"],
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching course difficulty data:", error);
      res.status(500).json({ error: "Error fetching course difficulty data" });
    }
  };
  

// Fetch student progress (Fixes 400 Bad Request)
export const student_Progress = async (req, res) => {
  try {
    // Aggregate progress data from Users collection
    const progressData = await User.aggregate([
      { $unwind: "$progress" }, // Unwind the progress array
      {
        $group: {
          _id: "$progress.courseId",
          avgCompletion: { $avg: "$progress.completionPercentage" },
        },
      },
    ]);

    if (!progressData.length) {
      return res.status(404).json({ message: "No progress data found." });
    }

    // Fetch course names
    const courseNames = await Promise.all(
      progressData.map(async (item) => {
        const course = await Course.findById(item._id).select("title");
        if (!course) {
          console.log("Course Not Found:", item._id);
          return "Unknown Course";
        }
        return course.title;
      })
    );

    res.json({
      labels: courseNames,
      datasets: [
        {
          label: "Average Completion Percentage",
          data: progressData.map((p) => p.avgCompletion),
          backgroundColor: "#36A2EB",
          borderColor: "#36A2EB",
          borderWidth: 1,
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    res.status(500).json({ error: "Error fetching student progress" });
  }
};


//Fetch quiz performance
export const quizPerformance = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("lessonId", "title");

    // Construct the response format expected by the frontend
    const quizPerformanceData = {
      lessonNames: quizzes.map((quiz) => quiz.lessonId.title),
      quizData: quizzes.map((quiz) => ({
        questionCount: quiz.questions.length,
      })),
    };

    res.json(quizPerformanceData);
  } catch (error) {
    console.error("Error fetching quiz performance:", error);
    res.status(500).json({ message: "Server error" });
  }
};

