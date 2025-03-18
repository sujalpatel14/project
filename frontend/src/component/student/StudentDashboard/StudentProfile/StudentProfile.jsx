import { useState, useEffect } from "react";
import axios from "axios";
import { Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import styles from "./StudentProfile.module.css";
import { API_PORT } from "../../../../../const";
import { useNavigate } from "react-router-dom";

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [name, setName] = useState("");
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [certificates, setCertificates] = useState([]); // ✅ Certificate state
  const PORT = API_PORT;
  const navigate = useNavigate();

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
      fetchCertificates(); // ✅ Fetch certificates
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Failed to load profile. Please try again.");
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

  const handleDownloadCertificate = async (courseId) => {
    try {
      const response = await axios.get(
        `${PORT}/api/student/download-certificate/${courseId}`,
        { withCredentials: true, responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Certificate_${courseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate.");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${PORT}/api/student/updateProfile`,
        { name },
        { withCredentials: true }
      );
      fetchStudentProfile();
      alert("Profile name updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile name.");
    }
  };

  const handleProfilePicChange = async (e) => {
    e.preventDefault();
    if (!newProfilePic) {
      alert("Please select a profile picture.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", newProfilePic);

    try {
      await axios.put(`${PORT}/api/student/updateProfilePic`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchStudentProfile();
      setNewProfilePic(null);
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      alert("Failed to update profile picture.");
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.put(
        `${PORT}/api/student/updatePassword`,
        { password },
        { withCredentials: true }
      );
      setPassword("");
      setConfirmPassword("");
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_PORT}/api/student/logout`, {}, { withCredentials: true });
      alert("Logout successful!"); 
      navigate("/login"); // Redirect to Login Page
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.logout}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
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
            <button type="submit" className={styles.updateButton}>
              Update Name
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
            <button type="submit" className={styles.updateButton}>
              Update Profile Picture
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
            <button type="submit" className={styles.updateButton}>
              Update Password
            </button>
          </form>

          {/* ✅ Certificate Download Section */}
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
          {/* ✅ End of Certificate Download Section */}

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
        <p className={styles.loading}>Loading profile...</p>
      )}
    </div>
  );
};

export default StudentProfile;
