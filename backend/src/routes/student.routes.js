import express from "express";
import { getStudentProfilePic, loginStudent, profile, registerUser, resetPassword, sendOTP, updateProfilePic, verifyOTP } from "../controllers/student.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { authCheck } from "../controllers/authController.js";
import { enrollCourse, getCourseById, getCourses, getEnrolledCourses } from "../controllers/course.controllers.js";
import { getLessonById, getLessonsWithQuizzes } from "../controllers/lesson.controllers.js";
import { run } from "../controllers/editorcode.controller.js";
import { getFeedback, submitFeedback } from "../controllers/feedback.controller.js";
import {  aiAssist } from "../controllers/ai.controller.js";
import { courseReviews, submitCouersFeedback } from "../controllers/courseFeedback.controller.js";
import { getQuizById, submitQuiz } from "../controllers/quiz.controllers.js";
import { createPost, getPosts, likePost } from "../controllers/communityController.js";
import upload from "../middlewares/upload.js";
import { getChallenges, submitChallenge } from "../controllers/challenges.controller.js";
import { downloadCertificate, getStudentCertificates } from "../controllers/certificate.controller.js";
import { Logout } from "../utils/Logout.js";
import { updateName, updatePassword } from "../controllers/user.controllers.js";

const router = express.Router();

router.post("/send-otp",sendOTP);

router.post("/verify-otp", verifyOTP);

router.post("/register", registerUser);

router.post("/resetPassword", resetPassword);

router.post("/login",loginStudent);

router.post("/logout",authMiddleware,Logout);

router.get("/auth-check", authMiddleware, authCheck);

router.get("/getCourses",authMiddleware,getCourses);

router.get("/enrolledCourses",authMiddleware,getEnrolledCourses);

router.post("/enroll", authMiddleware, enrollCourse); 

router.get("/:courseId/lessons", authMiddleware, getLessonsWithQuizzes);

router.get("/course/:courseId",authMiddleware,getCourseById)

router.post("/run",authMiddleware,run);

router.get("/lesson/:lessonId",authMiddleware,getLessonById);

router.post("/submitFeedback",submitFeedback);

router.post("/submitCourseFeedback",authMiddleware,submitCouersFeedback);

router.get("/getFeedback", getFeedback);

router.post("/aiAsist",authMiddleware,aiAssist);

router.get("/courseReviews/:courseId",authMiddleware,courseReviews);

router.get("/quiz/:quizId",authMiddleware, getQuizById);

router.post("/submitQuiz",authMiddleware, submitQuiz);

router.get("/posts",authMiddleware,getPosts);

router.post("/create",authMiddleware,createPost);

router.post("/like/:postId",authMiddleware,likePost);

router.get("/profile",authMiddleware,profile);

router.put("/updateProfilePic", upload.single("profilePic"), updateProfilePic);

router.get("/profilePic",authMiddleware, getStudentProfilePic);

router.get("/challenges",authMiddleware, getChallenges);

router.post("/submit-challenge/:id", authMiddleware,submitChallenge);

router.put("/updateProfile",authMiddleware,updateName);

router.put("/updatePassword",authMiddleware,updatePassword);

router.get("/certificates",authMiddleware,getStudentCertificates);

router.get("/download-certificate/:courseId",authMiddleware, downloadCertificate);

export default router;