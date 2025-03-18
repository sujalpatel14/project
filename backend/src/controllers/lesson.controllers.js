import { Lesson } from "../models/lesson.models.js";
import { Course } from "../models/course.models.js";
import { User } from "../models/user.models.js";
import { Quiz } from "../models/quiz.models.js"

// Controller to add a lesson
export const addLesson = async (req, res) => {
  try {
    const { courseId, title, content, videoUrl } = req.body;

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Create a new lesson
    const newLesson = new Lesson({
      courseId,
      title,
      content,
      videoUrl, 
    });

    // Save the lesson
    const savedLesson = await newLesson.save();

    course.lessons.push(savedLesson._id);
    await course.save();

    res.status(201).json(savedLesson);
  } catch (err) {
    console.error("Error adding lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLesson = async (req, res) => {
  try {
    const { courseId } = req.params;

    let lessons;

    if (courseId) {
      // Check if the course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Fetch lessons for the specific course
      lessons = await Lesson.find({ courseId });
    } else {
      // Fetch all lessons
      lessons = await Lesson.find().populate("courseId", "title"); // Populate course title
    }

    res.status(200).json(lessons);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params; // Get lesson ID from URL
    const { courseId, title, content, videoUrl } = req.body; // Destructure updated lesson data from the request body

    // Find and update the lesson
    const updatedLesson = await Lesson.findByIdAndUpdate(
      id,
      { courseId, title, content, videoUrl },
      { new: true, runValidators: true } // Return the updated document and validate inputs
    );

    if (!updatedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json(updatedLesson); // Return the updated lesson
  } catch (err) {
    console.error("Error updating lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params; // Get lesson ID from URL

    // Find and delete the lesson
    const deletedLesson = await Lesson.findByIdAndDelete(id);

    const course = await Course.findById(deletedLesson.courseId);
    if (course) {
      course.lessons = course.lessons.filter(
        (lessonId) => lessonId.toString() !== id
      );
      await course.save();
    }

    if (!deletedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (err) {
    console.error("Error deleting lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLessonsWithQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id; // Extracted from JWT token

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - User ID missing" });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Fetch all lessons of the course in **order**
    const lessons = await Lesson.find({ courseId }).sort({ _id: 1 }).select("_id title content");

    // Get student progress from the User collection
    const user = await User.findById(userId);
    const progress = user?.progress?.find((p) => p.courseId.toString() === courseId);

    let isUnlocked = true; // First lesson is always unlocked
    let lessonsWithQuizzes = [];

    for (const lesson of lessons) {
      const quiz = await Quiz.findOne({ lessonId: lesson._id }).select("_id title description");

      // **Check if this lesson's quiz is completed**
      const isQuizCompleted = progress?.completedLessons?.includes(lesson._id.toString()) || false;

      lessonsWithQuizzes.push({
        _id: lesson._id,
        title: lesson.title,
        content: lesson.content,
        quiz: quiz || null,
        isUnlocked, // If previous quiz is completed, unlock this lesson
      });

      // **If the quiz for this lesson is not completed, lock the next lessons**
      if (!isQuizCompleted) {
        isUnlocked = false;
      }
    }

    res.status(200).json(lessonsWithQuizzes);
  } catch (error) {
    console.error("Error fetching lessons with quizzes:", error);
    res.status(500).json({ error: "Error fetching lessons with quizzes" });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // Fetch the lesson from the database
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.status(200).json(lesson);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ message: "Server error" });
  }
};