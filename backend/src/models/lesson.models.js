import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the Lesson schema
const lessonSchema = new Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: false, // Optional, if not all lessons have videos
    },
    codeExamples: [
      {
        language: {
          type: String,
          required: true,
        },
        code: {
          type: String,
          required: true,
        },
      },
    ],
    quizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the Lesson model
export const Lesson = model('Lesson', lessonSchema);

