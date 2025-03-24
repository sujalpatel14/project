import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import { FaBars, FaTimes, FaUser } from "react-icons/fa";
import Logo from "./Logo.png";
import axios from "axios";
import { API_PORT } from "../../../../../const.js";

const Navbar = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const PORT = API_PORT;

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const res = await axios.get(`${PORT}/api/student/profilepic`, {
          withCredentials: true, // Send cookies for authentication
        });
        console.log(profilePic);
        setProfilePic(res.data.profilePic);
      } catch (e) {
        console.log("Error fetching profile pic:", e);
      }
    };
    fetchProfilePic();
  }, []);

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <div className={styles.logo}>
        <img src={Logo} alt="" />
        <Link to="/">CodeVerse</Link>
      </div>

      {/* Hamburger Menu */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Navigation Links */}
      <ul className={`${styles.navLinks} ${isOpen ? styles.open : ""}`}>
        {props.auth ? (
          <>
            <li>
              <Link to="/" onClick={toggleMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/courses" onClick={toggleMenu}>
                Courses
              </Link>
            </li>
            <li>
              <Link to="/my-courses" onClick={toggleMenu}>
                My Courses
              </Link>
            </li>
            <li>
              <Link to="/practice" onClick={toggleMenu}>
                Practice
              </Link>
            </li>
            <li>
              <Link to="/ai-assistance" onClick={toggleMenu}>
                AI-Assistance
              </Link>
            </li>
            <li>
              <Link to="/challenges" onClick={toggleMenu}>
                Challenges
              </Link>
            </li>
            <li>
              <Link to="/community" onClick={toggleMenu}>
                Community
              </Link>
            </li>
            <li className={styles.profileLink}>
              <Link
                to="/profile"
                onClick={toggleMenu}
                className={styles.profileContainer}
              >
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className={styles.profilePic}
                  />
                ) : (
                  <>
                    <FaUser className={styles.userIcon} /> Profile
                  </>
                )}
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/Login" onClick={toggleMenu}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/Sign-Up" onClick={toggleMenu}>
                Sign Up
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
