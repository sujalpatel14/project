import { useState} from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar.jsx";
import styles from "./AdminDashboard.module.css";
import Header from "./Header/Header";
import ManageUser from "./ManageUser/ManageUser.jsx";
import ManageCourses from "./ManageCourses/ManageCourses.jsx"
import ManageLessons from "./ManageLessons/ManageLessons.jsx";
import DashboardHome from "./AdminDashboardHome/DashboardHome.jsx";
import ManageQuizzes from "./ManageQuizzes/ManageQuizzes.jsx";
import ManageChallenges from "./ManageChallenges/ManageChallenges.jsx";
import MonitorStudentProgress from "./MonitorStudentProgress/MonitorStudentProgress.jsx";
import AdminCertificate from "./AdminCertificate/AdminCertificate.jsx";
import AdminProfile from "./AdminProfile/AdminProfile.jsx";
import AdminFeedback from "./AdminFeedback/AdminFeedback.jsx";

// import Content from "./Content/Content.jsx";

const AdminDashboard = () => {
  const [toggle, setToggle] = useState(true);

  const SlideToggle = () => {
    setToggle(!toggle);
  };

  return (
    <div className={styles.dashboardContainer}>
      {toggle?<Sidebar key={location.pathname}  SlideToggle={SlideToggle} />: null} 
      <div className={styles.mainContent}>
        <Header SlideToggle={SlideToggle} toggle={toggle} />
        <div className={styles.content}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/manage-users" element={<ManageUser />} />
            <Route path="/manage-courses" element={<ManageCourses />} />
            <Route path="/manage-lesson" element={<ManageLessons />} />
            <Route path="/manage-quizzes" element={<ManageQuizzes />} />
            <Route path="/manage-challenges" element={<ManageChallenges />} />
            <Route path="/student-progress" element={<MonitorStudentProgress />} />
            <Route path="/manage-certificate" element={<AdminCertificate />} />
            <Route path="/profile" element={<AdminProfile />} />
            <Route path="/feedback" element={<AdminFeedback />} />
          </Routes>
        </div>
        {/* <Content /> */}
      </div>
    </div>
  );
};

export default AdminDashboard;
