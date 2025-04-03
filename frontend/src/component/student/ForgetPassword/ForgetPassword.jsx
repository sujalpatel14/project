import { useState } from "react";
import axios from "axios";
import styles from "./ForgetPassword.module.css";
import { API_PORT } from "../../../../const";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import regimg from "./regimg.png";

const ForgetPassword = () => {
  const PORT = API_PORT;
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const type = "forget";
  const navigate = useNavigate();

  // **Email Validation Function**
  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  // **Password Validation Function**
  const isValidPassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);
  };

  // **Send OTP**
  const sendOtp = async () => {
    if (!email) {
      return setError("Email is required.");
    }
    if (!isValidEmail(email)) {
      return setError("Enter a valid email address.");
    }

    try {
      setLoader(true);
      setError("");
      await axios.post(`${PORT}/api/student/send-otp`, { email, type });
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.message || "Error sending OTP");
    } finally {
      setLoader(false);
    }
  };

  // **Verify OTP**
  const verifyOtp = async () => {
    if (!otp) {
      return setError("Please enter the OTP.");
    }
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return setError("OTP must be a 6-digit number.");
    }

    try {
      setLoader(true);
      setError("");
      const response = await axios.post(`${PORT}/api/student/verify-otp`, { email, otp });
      if (response.data.success) {
        setVerified(true);
        setStep(3);
      }
    } catch (error) {
      setError(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoader(false);
    }
  };

  // **Reset Password**
  const resetPassword = async () => {
    if (!password || !isValidPassword(password)) {
      return setError("Password must be at least 6 characters and include a number & special character.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoader(true);
      setError("");
      await axios.post(`${PORT}/api/student/resetPassword`, { email, password });
      window.customAlert("Password reset successful!");
      setStep(1);
      setEmail("");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Password reset failed");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className={styles.container}>
      <img src={regimg} alt="Forgot Password" />

      {step === 1 && (
        <div className={styles.formBox}>
          <h2>Forgot Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button onClick={sendOtp} className={styles.button} disabled={loader}>
            {loader ? <Loader /> : "Send OTP"}
          </button>
          <Link to="/Login">Login</Link>
        </div>
      )}

      {step === 2 && (
        <div className={styles.formBox}>
          <h2>Enter OTP</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button onClick={verifyOtp} className={styles.button} disabled={loader}>
            {loader ? <Loader /> : "Verify OTP"}
          </button>
          <Link to="/Login">Login</Link>
        </div>
      )}

      {step === 3 && verified && (
        <div className={styles.formBox}>
          <h2>Reset Password</h2>
          <div className={styles.passwordField}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
            <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          <div className={styles.passwordField}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
            />
            <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.eyeIcon}>
              {showConfirmPassword ? <FaEye />: <FaEyeSlash /> }
            </span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button onClick={resetPassword} className={styles.button} disabled={loader}>
            {loader ? <Loader /> : "Reset Password"}
          </button>
          <Link to="/Login">Login</Link>
        </div>
      )}
    </div>
  );
};

export default ForgetPassword;

// **Loader Component**
const Loader = () => {
  return <div className={styles.loader}></div>;
};
