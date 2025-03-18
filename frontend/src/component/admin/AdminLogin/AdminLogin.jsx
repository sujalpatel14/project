import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./AdminLogin.module.css";
import adminlogin from "../../../assets/adminlogin.svg";
import { API_PORT } from "../../../../const.js"; // Adjust if needed

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const PORT = API_PORT;
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    try {
      const response = await axios.post(
        `${PORT}/api/admin/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert("Login Successful! 🎉");
        navigate("/admin");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <img src={adminlogin} alt="Admin Login" />
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Admin Login</h2>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleLogin} className={styles.form}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />

          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
