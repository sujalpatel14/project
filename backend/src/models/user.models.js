import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Student', 'Admin'],
      default: 'student',
    },
    profilePic: {
      type: String,
      default: '',
    },
    progress: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        completedLessons: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
          },
        ],
        completionPercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        dateCreated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // Skip hashing if password is not modified
  }

  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
});

export const User = mongoose.model('User', UserSchema);
