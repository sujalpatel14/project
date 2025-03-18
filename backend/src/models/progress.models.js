import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  completedLessons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
  ],
  lastLessonViewed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
  },
  quizzesCompleted: [
    {
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
      score: {
        type: Number, // Store quiz score (0-100)
        default: 0,
      },
    },
  ],
  completionPercentage: {
    type: Number,
    default: 0, // Auto-update based on progress
  },
  isCourseCompleted: {
    type: Boolean,
    default: false, // True when all lessons are done
  },
  dateLastAccessed: {
    type: Date,
    default: Date.now, // Auto-update timestamp
  },
});

export const Progress = mongoose.model("Progress", ProgressSchema);
