import express, { response } from "express";
import upload from "../middlewares/upload.js";
import { addUser , getUsers , deleteUser , editUser, AdminLogin, updateName, updatePassword} from "../controllers/user.controllers.js";
import { addCourse , getCourses , deleteCourse , updateCourse} from "../controllers/course.controllers.js";
import { addLesson , getLesson , updateLesson , deleteLesson } from "../controllers/lesson.controllers.js";
import { addQuiz, deleteQuiz, getLessonsWithoutQuizzes, getQuizzesByCourse, updateQuiz } from "../controllers/quiz.controllers.js";
import { addChallenge, deleteChallenge, getChallengesByCourse, updateChallenge } from "../controllers/challenges.controller.js";
import { profile, studentProgress, updateProfilePic } from "../controllers/student.controller.js";
import { createOrUpdateCertificate, deleteCertificate, getCoursesWithCertificates } from "../controllers/certificate.controller.js";
import { adminAuth } from "../middlewares/authAdmin.js";
import { Logout } from "../utils/Logout.js";
import { courseDifficulty, quizPerformance, student_Progress, userData } from "../controllers/adminDashboard.controller.js";
import { getFeedbackByDate } from "../controllers/feedback.controller.js";

const router = express.Router();

router.get("/user-role-distribution",adminAuth,userData);

router.get("/course-difficulty",adminAuth,courseDifficulty);

router.get("/student-progress",adminAuth,student_Progress);

router.get("/quiz-performance",adminAuth,quizPerformance);
 
router.post("/addUser",adminAuth,addUser);

router.get("/getUsers",adminAuth,getUsers);

router.delete("/deleteUser/:id",adminAuth,deleteUser);

router.put("/updateUser/:id",adminAuth,editUser);

router.post("/addCourse",adminAuth, upload.single("image"), addCourse);

router.get("/getCourses",adminAuth,getCourses);

router.delete("/deleteCourse/:courseId",adminAuth,deleteCourse);

router.put("/updateCourse/:courseId",adminAuth, upload.single("image"), updateCourse);

router.post("/addLesson",adminAuth,addLesson);

router.get("/getLessons/:courseId",adminAuth, getLesson);

router.put("/lessons/:id",adminAuth, updateLesson); 

router.delete("/lessons/:id",adminAuth, deleteLesson);

router.get('/getLessonsWithoutQuizzes/:courseId',adminAuth, getLessonsWithoutQuizzes);

router.post('/addQuiz',adminAuth,addQuiz);

router.get('/getQuizzes/:courseId',adminAuth,getQuizzesByCourse);

router.put("/updateQuiz/:quizId",adminAuth, updateQuiz);

router.delete("/deleteQuiz/:quizId",adminAuth, deleteQuiz);

router.post("/challenges",adminAuth, addChallenge);

router.get("/getChallenges/:courseId",adminAuth, getChallengesByCourse);

router.put("/updateChallenges/:challengeId", adminAuth,updateChallenge);

router.delete("/deleteChallenge/:id",adminAuth, deleteChallenge);

router.get("/student_progress",adminAuth, studentProgress);

router.get("/courses-with-certificates",adminAuth,getCoursesWithCertificates);

router.post("/create-certificate",adminAuth,createOrUpdateCertificate);

router.delete("/delete-certificate/:id",adminAuth,deleteCertificate);

router.get("/profile",adminAuth,profile);

router.put("/updateProfilePic",adminAuth, upload.single("profilePic"), updateProfilePic);

router.put("/updateProfile",adminAuth,updateName);

router.put("/updatePassword",adminAuth,updatePassword);

router.post("/login",AdminLogin);

router.get("/feedback", adminAuth,getFeedbackByDate);

router.get("/check-auth", adminAuth , (req, res) => {
    res.json({ isAuthenticated: true });
  });

router.post("/logout",adminAuth,Logout);

export default router;