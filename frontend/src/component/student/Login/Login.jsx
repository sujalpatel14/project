import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import styles from "./Login.module.css";
import axios from "axios";
import { API_PORT } from "../../../../const";
import { NavLink, useNavigate } from "react-router-dom";
import loginimg from "./loginimg.jpg"

const Login = () => {
  const PORT = API_PORT;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return setError("All fields are required.");
    }

    try {
      setLoading(true);
      setError("");
      await axios.post(`${PORT}/api/student/login`, { email, password }, { withCredentials: true });
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <img
        src={loginimg}
        alt=""
      />
      <div className={styles.formBox}>
        <h2>Login</h2>

        {/* Email Input with Icon */}
        <div className={styles.inputBox}>
          <FaUser className={styles.icon} />
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
        </div>

        {/* Password Input with Eye Toggle and Lock Icon */}
        <div className={styles.inputBox}>
          <FaLock className={styles.icon} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          <button type="button" className={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button onClick={handleLogin} className={styles.button} disabled={loading}>
          {loading ? <div className={styles.loader}></div> : "Login"}
        </button>

        <p className={styles.link}><NavLink to="/ForgetPassword">Forgot Password?</NavLink></p>
        <p className={styles.link}><NavLink to="/Sign-Up">Create An Account?</NavLink></p>
        <p className={styles.link}><NavLink to="/admin">Admin For Only</NavLink></p>
      </div>
    </div>
  );
};

export default Login;
