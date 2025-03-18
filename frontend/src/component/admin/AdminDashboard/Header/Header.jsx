/* eslint-disable react/prop-types */
import styles from "./Header.module.css";
import { GiHamburgerMenu } from "react-icons/gi";
import { RiAdminFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_PORT } from "../../../../../const.js";

const Header = ({ SlideToggle, toggle }) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await axios.post(`${API_PORT}/api/admin/logout`, {}, { withCredentials: true });
      alert("Logout successful!"); 
      navigate("/admin-login"); // Redirect to Admin Login
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <header className={styles.header}>
      {!toggle ? (
        <div onClick={SlideToggle} className={styles.HamBurger}>
          <GiHamburgerMenu />
        </div>
      ) : (
        <span></span>
      )}
      <div className={styles.profile}>
        <div>
          <span>Admin</span>
          <RiAdminFill />
        </div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </header>
  );
};

export default Header;
