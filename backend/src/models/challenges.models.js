import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  starterCode: {
    type: String,
    required: true
  },
  testCases: [
    {
      input: {
        type: String,
        required: true
      },
      expectedOutput: {
        type: String,
        required: true
      }
    }
  ], 
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true
  }
}, { timestamps: true });

export const Challenge = mongoose.model("Challenge", challengeSchema);