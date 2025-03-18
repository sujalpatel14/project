import { useState } from "react";
import styles from "./Login.module.css";
import axios from "axios";
import { API_PORT } from "../../../../const";
import { NavLink , useNavigate} from "react-router-dom";

const Login = () => {
  const PORT = API_PORT;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // **Login Function**
  const handleLogin = async () => {
    if (!email || !password) {
      return setError("All fields are required.");
    }
    
    try {
      setLoading(true);
      setError("");
      await axios.post(`${PORT}/api/student/login`, { email, password },{ withCredentials: true });
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <img src="https://img.freepik.com/premium-vector/web-developer-wiring-code-program_773186-895.jpg" alt="" />
        <div className={styles.formBox}>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button onClick={handleLogin} className={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className={styles.link}><NavLink to="/ForgetPassword">Forgot Password?</NavLink></p>
          <p className={styles.link}><NavLink to="/Sign-Up">Create An Account?</NavLink></p>
        </div>
    </div>
  );
};

export default Login;
