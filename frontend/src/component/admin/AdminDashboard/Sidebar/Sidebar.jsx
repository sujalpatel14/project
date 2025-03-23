import { memo, useMemo, lazy, Suspense } from "react";
import styles from "./Sidebar.module.css";
import { VscChromeClose } from "react-icons/vsc";
import { NavLink } from "react-router-dom";

// Lazy Load Heavy Icons for Performance
const MdSpaceDashboard = lazy(() => import("react-icons/md").then(m => ({ default: m.MdSpaceDashboard })));
const HiMiniUser = lazy(() => import("react-icons/hi2").then(m => ({ default: m.HiMiniUser })));
const FaBook = lazy(() => import("react-icons/fa").then(m => ({ default: m.FaBook })));
const MdOutlinePlayLesson = lazy(() => import("react-icons/md").then(m => ({ default: m.MdOutlinePlayLesson })));
const MdQuiz = lazy(() => import("react-icons/md").then(m => ({ default: m.MdQuiz })));
const IoTrophy = lazy(() => import("react-icons/io5").then(m => ({ default: m.IoTrophy })));
const GiProgression = lazy(() => import("react-icons/gi").then(m => ({ default: m.GiProgression })));
const BiCategory = lazy(() => import("react-icons/bi").then(m => ({ default: m.BiCategory })));
const IoIosSettings = lazy(() => import("react-icons/io").then(m => ({ default: m.IoIosSettings })));
const MdSecurity = lazy(() => import("react-icons/md").then(m => ({ default: m.MdSecurity })));
const MdFeedback = lazy(() => import("react-icons/md").then(m => ({ default: m.MdFeedback })));
const IoIosAnalytics = lazy(() => import("react-icons/io").then(m => ({ default: m.IoIosAnalytics })));

// eslint-disable-next-line react/prop-types
const Sidebar = ({ SlideToggle }) => {
  // Memoized Sidebar Links to Prevent Re-Renders
  const sidebarLinks = useMemo(() => [
    { to: "/admin", icon: <MdSpaceDashboard />, label: "Dashboard" },
    { to: "/admin/manage-users", icon: <HiMiniUser />, label: "Manage Users" },
    { to: "/admin/manage-courses", icon: <FaBook />, label: "Manage Courses" },
    { to: "/admin/manage-lesson", icon: <MdOutlinePlayLesson />, label: "Manage Lessons" },
    { to: "/admin/manage-quizzes", icon: <MdQuiz />, label: "Manage Quizzes" },
    { to: "/admin/manage-challenges", icon: <IoTrophy />, label: "Manage Challenges" },
    { to: "/admin/student-progress", icon: <GiProgression />, label: "Monitor Student Progress" },
    { to: "/admin/manage-certificate", icon: <BiCategory />, label: "Manage Certificate" },
    { to: "/admin/profile", icon: <IoIosSettings />, label: "Manage Profile" },
    { to: "/admin/feedback", icon: <MdFeedback />, label: "Feedbacks" },
    // { to: "/admin/analytics", icon: <IoIosAnalytics />, label: "View Analytics" },
  ], []);

  return (
    <div className={styles.sidebar}>
      <div className={styles.close} onClick={SlideToggle} role="button" aria-label="Close Sidebar">
        <VscChromeClose />
      </div>
      <header>
        <h2>Admin Dashboard</h2>
      </header>
      <ul>
        {sidebarLinks.map((link) => (
          <NavLink key={link.to} to={link.to} end className={({ isActive }) => (isActive ? `${styles.active} ${styles.navItem}` : styles.navItem)}>
            <li>
              <Suspense fallback={<span>Loading...</span>}>{link.icon}</Suspense> {link.label}
            </li>
          </NavLink>
        ))}
      </ul>
    </div>
  );
};

// Memoize the Sidebar Component to Prevent Re-Renders
export default memo(Sidebar);
