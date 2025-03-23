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

router.get("/user-role-distribution",userData);

router.get("/course-difficulty",courseDifficulty);

router.get("/student-progress",student_Progress);

router.get("/quiz-performance",quizPerformance);
 
router.post("/addUser",addUser);

router.get("/getUsers",getUsers);

router.delete("/deleteUser/:id",deleteUser);

router.put("/updateUser/:id",editUser);

router.post("/addCourse", upload.single("image"), addCourse);

router.get("/getCourses",getCourses);

router.delete("/deleteCourse/:courseId",deleteCourse);

router.put("/updateCourse/:courseId", upload.single("image"), updateCourse);

router.post("/addLesson",addLesson);

router.get("/getLessons/:courseId", getLesson);

router.put("/lessons/:id", updateLesson); 

router.delete("/lessons/:id", deleteLesson);

router.get('/getLessonsWithoutQuizzes/:courseId', getLessonsWithoutQuizzes);

router.post('/addQuiz',addQuiz);

router.get('/getQuizzes/:courseId',getQuizzesByCourse);

router.put("/updateQuiz/:quizId", updateQuiz);

router.delete("/deleteQuiz/:quizId", deleteQuiz);

router.post("/challenges", addChallenge);

router.get("/getChallenges/:courseId", getChallengesByCourse);

router.put("/updateChallenges/:challengeId", updateChallenge);

router.delete("/deleteChallenge/:id", deleteChallenge);

router.get("/student-progress", studentProgress);

router.get("/courses-with-certificates",getCoursesWithCertificates);

router.post("/create-certificate",createOrUpdateCertificate);

router.delete("/delete-certificate/:id",deleteCertificate);

router.get("/profile",profile);

router.put("/updateProfilePic", upload.single("profilePic"), updateProfilePic);

router.put("/updateProfile",updateName);

router.put("/updatePassword",updatePassword);

router.post("/login",AdminLogin);

router.get("/feedback", getFeedbackByDate);

router.get("/check-auth", adminAuth , (req, res) => {
    res.json({ isAuthenticated: true });
  });

router.post("/logout",Logout);

export default router;