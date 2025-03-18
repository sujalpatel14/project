import { useState, useEffect } from "react";
import axios from "axios";
import { API_PORT } from "../../../../../const.js"; 
import styles from "./AdminProfile.module.css";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [name, setName] = useState("");
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [password, setPassword] = useState("");
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
      alert("Failed to load profile.");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_PORT}/api/admin/updateProfile`, { name }, { withCredentials: true });
      fetchAdminProfile();
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
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
      await axios.put(`${API_PORT}/api/admin/updateProfilePic`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchAdminProfile();
      setNewProfilePic(null);
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      alert("Failed to update profile picture.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.put(`${API_PORT}/api/admin/updatePassword`, { password }, { withCredentials: true });
      setPassword("");
      setConfirmPassword("");
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password.");
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
        </>
      ) : (
        <p className={styles.loading}>Loading profile...</p>
      )}
    </div>
  );
};

export default AdminProfile;
