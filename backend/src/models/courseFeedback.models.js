import mongoose from "mongoose";

const courseFeedbackSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Reference to Course model
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to Student model
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // Ratings are between 1 and 5 stars
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const CourseFeedback = mongoose.model("CourseFeedback", courseFeedbackSchema);

export default CourseFeedback;
