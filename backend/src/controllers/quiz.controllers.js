import { Lesson } from "../models/lesson.models.js";
import { Quiz } from "../models/quiz.models.js";
import { Progress } from "../models/progress.models.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js"

// Controller function to get lessons with no quizzes
export const getLessonsWithoutQuizzes = async (req, res) => {
  const { courseId } = req.params;

  try {
    // Find all lessons for the given courseId
    const lessons = await Lesson.find({ courseId });

    // Find quizzes for the selected courseId
    const quizzes = await Quiz.find({ lessonId: { $in: lessons.map(lesson => lesson._id) } });

    // Get lessons that don't have any quizzes associated
    const lessonIdsWithQuizzes = quizzes.map(quiz => quiz.lessonId.toString());

    const lessonsWithoutQuizzes = lessons.filter(lesson => !lessonIdsWithQuizzes.includes(lesson._id.toString()));

    res.status(200).json(lessonsWithoutQuizzes);
  } catch (err) {
    console.error("Error fetching lessons without quizzes:", err);
    res.status(500).json({ message: "Server error, unable to fetch lessons." });
  }
};

export const addQuiz = async (req, res) => {
  const { lessonId, questions } = req.body;

  try {
    // Check if the lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Create a new quiz object
    const newQuiz = new Quiz({
      lessonId,
      questions,
    });

    // Save the new quiz
    const savedQuiz = await newQuiz.save();

    // Return the saved quiz
    res.status(201).json(savedQuiz);
  } catch (err) {
    console.error("Error adding quiz:", err);
    res.status(500).json({ message: "Server error, unable to add quiz." });
  }
};

export const getQuizzesByCourse = async (req, res) => {
  
  const { courseId } = req.params;

  try {
    // Find all lessons that belong to the selected course
    const lessons = await Lesson.find({ courseId }).select("_id title");

    if (!lessons.length) {
      return res.status(404).json({ message: "No lessons found for this course" });
    }

    const lessonIds = lessons.map((lesson) => lesson._id);

    // Find all quizzes associated with the lessons in this course
    const quizzes = await Quiz.find({ lessonId: { $in: lessonIds } }).populate("lessonId", "title");

    if (!quizzes.length) {
      return res.status(200).json({ message: "No quizzes found for this course", quizzes: [] });
    }

    res.status(200).json(quizzes);
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    res.status(500).json({ message: "Server error, unable to fetch quizzes." });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params; // Extract quiz ID from request params
    const updatedQuizData = req.body; // Get new quiz data from request body

    // Find and update the quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      updatedQuizData,
      { new: true, runValidators: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params; // Extract quiz ID from request params

    // Find and delete the quiz
    const deletedQuiz = await Quiz.findByIdAndDelete(quizId);

    if (!deletedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get quiz by lesson ID
export const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Find quiz and populate lesson title and its associated course title
    const quiz = await Quiz.findById(quizId)
      .populate({
        path: "lessonId",
        select: "title courseId", // Fetch lesson title and courseId
        populate: {
          path: "courseId",
          select: "title", // Fetch course title
        },
      });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({
      quiz,
      lessonTitle: quiz.lessonId?.title || "N/A",
      courseTitle: quiz.lessonId?.courseId?.title || "N/A"
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const submitQuiz = async (req, res) => {
  try {
    const { quizId, selectedAnswers } = req.body;
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    // Decode token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Fetch quiz and populate lesson & course
    const quiz = await Quiz.findById(quizId).populate({
      path: "lessonId",
      populate: { path: "courseId", select: "title" },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let correctCount = 0;

    // Check selected answers
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    // Calculate quiz score
    const score = (correctCount / quiz.questions.length) * 100;
    const lessonId = quiz.lessonId._id.toString();
    const courseId = quiz.lessonId.courseId._id.toString();

    // Find or create student progress
    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      progress = new Progress({
        userId,
        courseId,
        completedLessons: [],
        quizzesCompleted: [],
        dateLastAccessed: new Date(),
      });
    }

    // Mark lesson as completed
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    // Ensure quizzesCompleted is initialized
    if (!progress.quizzesCompleted) {
      progress.quizzesCompleted = [];
    }

    // Check if quiz is already attempted
    const existingQuizIndex = progress.quizzesCompleted.findIndex(q => q.quizId?.toString() === quizId);

    if (existingQuizIndex === -1) {
      // If quiz not attempted, add new entry
      progress.quizzesCompleted.push({ quizId, score });
    } else {
      // If quiz exists, update the score
      progress.quizzesCompleted[existingQuizIndex].score = score;
    }

    // Update last access date
    progress.dateLastAccessed = new Date();

    // Calculate completion percentage
    const totalLessons = await Lesson.countDocuments({ courseId });
    progress.completionPercentage = ((progress.completedLessons.length / totalLessons) * 100).toFixed(2);

    // Mark course as completed if all lessons are done
    progress.isCourseCompleted = progress.completionPercentage === "100.00";

    await progress.save();

    // **🟢 Update User Progress in Users Collection**
    const user = await User.findById(userId);

    if (user) {
      let userProgress = user.progress.find(p => p.courseId.toString() === courseId);

      if (!userProgress) {
        // If no progress for this course, create new progress entry
        user.progress.push({
          courseId,
          completedLessons: [lessonId],
          completionPercentage: progress.completionPercentage,
        });
      } else {
        // If progress exists, update it
        if (!userProgress.completedLessons.includes(lessonId)) {
          userProgress.completedLessons.push(lessonId);
        }

        userProgress.completionPercentage = progress.completionPercentage;
      }

      await user.save();
    }

    res.json({
      message: "Quiz submitted successfully!",
      score,
      progress,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ message: "Server error" });
  }
};