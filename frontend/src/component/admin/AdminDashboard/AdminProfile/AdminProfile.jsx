import { useState, useEffect } from "react";
import axios from "axios";
import { API_PORT } from "../../../../../const.js"; 
import styles from "./AdminProfile.module.css";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [profilePicError, setProfilePicError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const PORT = API_PORT;
  
  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const { data } = await axios.get(`${PORT}/api/admin/profile`, { withCredentials: true });
      setAdmin(data);
      setName(data.name);
    } catch (error) {
      console.error("Error fetching profile:", error);
      window.customAlert("Failed to load profile.");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Name cannot be empty.");
      return;
    } else {
      setNameError(""); // Clear error if input is valid
    }
    try {
      await axios.put(`${API_PORT}/api/admin/updateProfile`, { name }, { withCredentials: true });
      fetchAdminProfile();
      window.customAlert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      window.customAlert("Failed to update profile.");
    }
  };

  const handleProfilePicChange = async (e) => {
    e.preventDefault();
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

    const formData = new FormData();
    formData.append("profilePic", newProfilePic);

    try {
      await axios.put(`${API_PORT}/api/admin/updateProfilePic`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchAdminProfile();
      setNewProfilePic(null);
      window.customAlert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      window.customAlert("Failed to update profile picture.");
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
    try {
      await axios.put(`${API_PORT}/api/admin/updatePassword`, { password }, { withCredentials: true });
      setPassword("");
      setConfirmPassword(""); //Use the corrected variable
      window.customAlert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      window.customAlert("Failed to update password.");
    }
  };

  return (
    <div className={styles.profileContainer}>
      {admin ? (
        <>
          <div className={styles.profileWrapper}>
            <img src={admin.profilePic || "/default-avatar.png"} alt="Profile" className={styles.profilePic} />
            <div className={styles.profileInfo}>
              <h2 className={styles.name}>{admin.name}</h2>
              <p className={styles.email}>{admin.email}</p>
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
            {profilePicError && <p className={styles.error}>{profilePicError}</p>}
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
            {passwordError && <p className={styles.error}>{passwordError}</p>}
            <button type="submit" className={styles.updateButton}>
              Update Password
            </button>
          </form>
        </>
      ) : (
        <p className={styles.loading}>Loading profile...</p>
      )}
    </div>
  );
};

export default AdminProfile;
