import { useState, useEffect } from "react";
import axios from "axios";
import { Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import styles from "./StudentProfile.module.css";
import { API_PORT } from "../../../../../const";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader.jsx";

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [profilePicError, setProfilePicError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [certificates, setCertificates] = useState([]); //Certificate state
  const PORT = API_PORT;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const { data } = await axios.get(`${PORT}/api/student/profile`, {
        withCredentials: true,
      });
      setStudent(data);
      setName(data.name);
      fetchCertificates(); //Fetch certificates
    } catch (error) {
      console.error("Error fetching profile:", error);
      window.customAlert("Failed to load profile. Please try again.");
    }
  };

  const fetchCertificates = async () => {
    try {
      const { data } = await axios.get(`${PORT}/api/student/certificates`, {
        withCredentials: true,
      });
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const handleDownloadCertificate = (courseId) => {
    navigate("/certificate", {
      state: { courseId }, // Pass data
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setNameError("Name cannot be empty.");
      return;
    } else {
      setNameError(""); // Clear error if input is valid
    }
    if (isLoading) return;
    setIsLoading(true);
    try {
      await axios.put(
        `${PORT}/api/student/updateProfile`,
        { name },
        { withCredentials: true }
      );
      fetchStudentProfile();
      window.customAlert("Profile name updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      window.customAlert("Failed to update profile name.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePicChange = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!newProfilePic) {
      setProfilePicError("Please select an image.");
      return;
    } else if (!["image/jpeg", "image/png", "image/gif"].includes(newProfilePic.type)) {
      setProfilePicError("Invalid file type. Only JPEG, PNG, and GIF are allowed.");
      return;
    } else if (newProfilePic.size > 2 * 1024 * 1024) { // 2MB limit
      setProfilePicError("File size exceeds 2MB. Please select a smaller file.");
      return;
    } else {
      setProfilePicError(""); }
    setIsLoading(true);

    const formData = new FormData();
    formData.append("profilePic", newProfilePic);

    try {
      await axios.put(`${PORT}/api/student/updateProfilePic`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchStudentProfile();
      setNewProfilePic(null);
      window.customAlert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      window.customAlert("Failed to update profile picture.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidPassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(
      password
    );
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    // Validation: Ensure passwords are not empty and meet criteria
    if (!password.trim() || !confirmPassword.trim()) {
      setPasswordError("Both password fields are required.");
      return;
    } else if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    } else if (!isValidPassword(password)) {
      setPasswordError(
        "Password must be at least 6 characters long, include a letter, a number, and a special character."
      );
      return;
    } else {
      setPasswordError(""); // Clear error if valid
    }
    setIsLoading(true);
    try {
      await axios.put(
        `${PORT}/api/student/updatePassword`,
        { password },
        { withCredentials: true }
      );
      setPassword("");
      setConfirmPassword("");
      window.customAlert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      window.customAlert("Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await axios.post(
        `${API_PORT}/api/student/logout`,
        {},
        { withCredentials: true }
      );
      window.customAlert("Logout successful!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const doughnutData = {
    labels:
      student?.progress.map((course) =>
        course.courseId ? course.courseId.title : "Unknown Course"
      ) || [],
    datasets: [
      {
        data:
          student?.progress.map((course) => course.completionPercentage) || [],
        backgroundColor: ["#36A2EB", "#4BC0C0", "#FFCE56", "#FF6384"],
        hoverOffset: 10,
      },
    ],
  };

  const lineData = {
    labels:
      student?.progress.map((course) =>
        course.courseId ? course.courseId.title : "Unknown Course"
      ) || [],
    datasets: [
      {
        label: "Course Progress",
        data:
          student?.progress.map((course) => course.completionPercentage) || [],
        fill: false,
        borderColor: "#36A2EB",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.logout}>
        <button
          onClick={handleLogout}
          className={styles.logoutButton}
          disabled={isLoading}
        >
          {isLoading ? "Logging out..." : "Logout"}
        </button>
      </div>
      {student ? (
        <>
          <div className={styles.profileWrapper}>
            <img
              src={student.profilePic || "/default-avatar.png"}
              alt="Profile"
              className={styles.profilePic}
            />
            <div className={styles.profileInfo}>
              <h2 className={styles.name}>{student.name}</h2>
              <p className={styles.email}>{student.email}</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className={styles.form}>
            <label className={styles.label}>Update Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
            {nameError && <p className={styles.error}>{nameError}</p>}
            <button
              type="submit"
              className={styles.updateButton}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Name"}
            </button>
          </form>

          <form onSubmit={handleProfilePicChange} className={styles.form}>
            <label className={styles.label}>Change Profile Picture:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewProfilePic(e.target.files[0])}
              className={styles.fileInput}
            />
            {profilePicError && <p className={styles.error}>{profilePicError}</p>}
            <button
              type="submit"
              className={styles.updateButton}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Profile Picture"}
            </button>
          </form>

          <form onSubmit={handlePasswordChange} className={styles.form}>
            <label className={styles.label}>New Password:</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
            <label className={styles.label}>Confirm Password:</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
            />
            {passwordError && <p className={styles.error}>{passwordError}</p>}
            <button
              type="submit"
              className={styles.updateButton}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>

          {/* Certificate Download Section */}
          <div className={styles.certificateSection}>
            <h3 className={styles.sectionTitle}>Download Your Certificates</h3>
            {certificates.length > 0 ? (
              <ul className={styles.certificateList}>
                {certificates.map((cert) => (
                  <li
                    key={cert.courseId._id}
                    className={styles.certificateItem}
                  >
                    <span>{cert.courseId.title}</span>
                    <button
                      className={styles.downloadButton}
                      onClick={() =>
                        handleDownloadCertificate(cert.courseId._id)
                      }
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noCertificates}>
                No certificates available yet.
              </p>
            )}
          </div>
          {/*End of Certificate Download Section */}

          <div className={styles.progressWrapper}>
            <div className={styles.chartContainer}>
              <h3 className={styles.chartTitle}>Overall Course Completion</h3>
              {student.progress.length > 0 ? (
                <Doughnut data={doughnutData} />
              ) : (
                <p className={styles.noData}>No courses yet.</p>
              )}
            </div>

            <div className={styles.chartContainer}>
              <h3 className={styles.chartTitle}>Progress Over Time</h3>
              {student.progress.length > 0 ? (
                <Line data={lineData} />
              ) : (
                <p className={styles.noData}>No progress data.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default StudentProfile;
