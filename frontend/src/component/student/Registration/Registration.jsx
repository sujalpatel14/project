import { useState, useRef } from "react";
import styles from "./Registration.module.css";
import axios from "axios";
import { API_PORT } from "../../../../const";
import { Link, useNavigate } from "react-router-dom";
import regimg from "./regimg.png";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const Registration = () => {
  const PORT = API_PORT;
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const nameRef = useRef();
  const passwordRef = useRef();
  const [loder, setLoder] = useState(false);
  const [error, setError] = useState("");
  const type = "verify";
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // **Email Validation Function**
  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  //  **Password Validation Function**
  const isValidPassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);
  };

  //  **Send OTP**
  const sendOtp = async () => {
    if (!email) {
      return setError("Email is required.");
    }
    if (!isValidEmail(email)) {
      return setError("Enter a valid email address.");
    }

    try {
      setLoder(true);
      setError(""); // Clear previous errors
      await axios.post(`${PORT}/api/student/send-otp`, { email , type});
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.message || "Error sending OTP");
    } finally {
      setLoder(false);
    }
  };

  //  **Verify OTP**
  const verifyOtp = async () => {
    if (!otp) {
      return setError("Please enter the OTP.");
    }
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return setError("OTP must be a 6-digit number.");
    }

    try {
      setLoder(true);
      setError("");
      const response = await axios.post(`${PORT}/api/student/verify-otp`, { email, otp });
      if (response.data.success) {
        setVerified(true);
        setStep(3);
      }
    } catch (error) {
      setError(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoder(false);
    }
  };

  //  **Register User**
  const registerUser = async () => {
    const name = nameRef.current?.value.trim();
    const password = passwordRef.current?.value.trim();

    if (!name || name.length < 3) {
      return setError("Full name must be at least 3 characters.");
    }
    if (!password || !isValidPassword(password)) {
      return setError("Password must be at least 6 characters and include a number & special character.");
    }

    try {
      setLoder(true);
      setError("");
      await axios.post(`${PORT}/api/student/register`, { email, name, password });
      window.customAlert("Registration successful!");
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoder(false);
    }
  };

  return (
    <div className={styles.container}>
      <img src={regimg} alt="" />
      
      {step === 1 && (
        <div className={styles.formBox}>
          <h1>Registration</h1>
          <h3>Email Verification</h3>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}

          <button onClick={sendOtp} className={styles.button} disabled={loder}>
            {loder ? <Loder /> : "Send OTP"}
          </button>
          <Link to="/Login">You Have Already Account</Link>
        </div>
      )}

      {step === 2 && (
        <div className={styles.formBox}>
          <h1>Registration</h1>
          <h3>Enter OTP</h3>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}

          <button onClick={verifyOtp} className={styles.button} disabled={loder}>
            {loder ? <Loder /> : "Verify OTP"}
          </button>
          <Link to="/Login">You Have Already Account</Link>
        </div>
      )}

      {step === 3 && verified && (
        <div className={styles.formBox}>
          <h1>Registration</h1>
          <h3>Register Form</h3>
          <input type="text" placeholder="Full Name" ref={nameRef} className={styles.input} />
          <input type="email" value={email} className={styles.input} disabled />
          {/* Password Input with Eye Toggle */}
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              ref={passwordRef}
              className={styles.input}
            />
            <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
              {showPassword ?<AiFillEye /> : <AiFillEyeInvisible /> }
            </span>
          </div>
          {error && <p className={styles.error}>{error}</p>}

          <button onClick={registerUser} className={styles.button} disabled={loder}>
            {loder ? <Loder /> : "Register"}
          </button>
          <Link to="/Login">You Have Already Account</Link>
        </div>
      )}
    </div>
  );
};

export default Registration;

// **Loader Component**
const Loder = () => {
  return <div className={styles.loder}></div>;
};
