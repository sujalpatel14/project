import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar/Navbar.jsx";
import Footer from "./Footer/Footer.jsx";
import styles from "./StudentDashboard.module.css";
import Home from "./Home/Home.jsx";
import Courses from "./Courses/Courses.jsx";
import MyCourses from "./MyCourses/MyCourses.jsx";
import Practice from "./Practice/Practice.jsx";
import Lesson from "./Lesson/Lesson.jsx";
import { API_PORT } from "../../../../const.js";
import axios from "axios";
import AIChatBox from "./AIChatBox/AIChatBox.jsx";
import StudentProtectedRoute from "../StudentProtectedRoute.jsx";
import CourseDetails from "./CourseDetail/CourseDetail.jsx";
import Quiz from "./Quiz/Quiz.jsx";
import Community from "./Community/Community.jsx";
import StudentProfile from "./StudentProfile/StudentProfile.jsx";
import StudentChallenges from "./StudentChallenges/StudentChallenges.jsx";

const StudentDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const PORT = API_PORT;
  useEffect(() => {
    // Verify authentication by checking token in cookies
    const verifyAuth = async () => {
      try {
        const response = await axios.get(`${PORT}/api/student/auth-check`, {
          withCredentials: true,
        });
        if (response.data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
        console.error(error);
      }
    };
    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={styles.dashboard}>
      <Navbar auth={isAuthenticated} />
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Home auth={isAuthenticated} />} />

          <Route element={<StudentProtectedRoute />}>
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/lesson/:lessonId" element={<Lesson />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/ai-assistance" element={<AIChatBox />} />
            <Route path="/quiz/:quizId" element={<Quiz />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<StudentProfile />} />
            <Route path="/challenges" element={<StudentChallenges />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
