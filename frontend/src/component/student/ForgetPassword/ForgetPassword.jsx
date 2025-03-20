import { useState } from "react";
import axios from "axios";
import styles from "./ForgetPassword.module.css";
import { API_PORT } from "../../../../const";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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

  const sendOtp = async () => {
    try {
      setLoader(true);
      setError("");
      await axios.post(`${PORT}/api/student/send-otp`, { email , type });
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.message || "Error sending OTP");
    } finally {
      setLoader(false);
    }
  };

  const verifyOtp = async () => {
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

  const resetPassword = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
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
      <img
        src="https://img.freepik.com/premium-vector/web-developer-wiring-code-program_773186-895.jpg"
        alt="Forgot Password"
      />
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
          <button onClick={sendOtp} className={styles.button}>
            {loader ? <Loader /> : "Send OTP"}
          </button>
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
          <button onClick={verifyOtp} className={styles.button}>
            {loader ? <Loader /> : "Verify OTP"}
          </button>
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
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
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
            <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button onClick={resetPassword} className={styles.button}>
            {loader ? <Loader /> : "Reset Password"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgetPassword;

const Loader = () => {
  return <div className={styles.loader}></div>;
};
