import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the course schema
const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String, // Storing the image URL
      required: false, // Optional field
    },
    lessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson", // Assuming there's a Lesson model
      },
    ],
  },
  { timestamps: true }
);

// Create the model
export const Course = mongoose.model("Course", courseSchema);
