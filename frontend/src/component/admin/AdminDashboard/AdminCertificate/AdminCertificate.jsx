import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AdminCertificate.module.css";
import { API_PORT } from "../../../../../const";

const AdminCertificate = () => {
  const [coursesWithCertificate, setCoursesWithCertificate] = useState([]);
  const [coursesWithoutCertificate, setCoursesWithoutCertificate] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [minLectures, setMinLectures] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${API_PORT}/api/admin/courses-with-certificates`,
        { withCredentials: true }
      );
      setCoursesWithCertificate(data.coursesWithCertificate);
      setCoursesWithoutCertificate(data.coursesWithoutCertificate);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
    setLoading(false);
  };

  const handleCreateOrUpdateCertificate = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !minLectures) {
      window.customAlert("Please select a course and enter required lectures.");
      return;
    }

    try {
      await axios.post(
        `${API_PORT}/api/admin/create-certificate`,
        { courseId: selectedCourse, minLecturesRequired: minLectures },
        { withCredentials: true }
      );
      window.customAlert("Certificate saved successfully!");
      fetchCourses();
      resetForm();
    } catch (error) {
      console.error("Error saving certificate:", error);
      window.customAlert("Failed to save certificate.");
    }
  };

  const handleDeleteCertificate = async (id) => {
    window.customConfirm("Are you sure you want to delete this certificate?", async (isConfirmed) => {
      if (!isConfirmed) return; // If user cancels, exit function
  
      try {
        await axios.delete(`${API_PORT}/api/admin/delete-certificate/${id}`, {
          withCredentials: true,
        });
  
        window.customAlert("Certificate deleted successfully!");
        fetchCourses(); // Refresh courses after deletion
      } catch (error) {
        console.error("Error deleting certificate:", error);
        window.customAlert("Failed to delete certificate.");
      }
    });
  };
  
  

  // 📌 Reset Form (For Cancel Button)
  const resetForm = () => {
    setSelectedCourse("");
    setMinLectures("");
    setEditingCertificate(null);
  };

  return (
    <div className={styles.container}>
      <h2>Manage Course Certificates</h2>

      {/* 📌 Certificate Creation Form */}
      <div className={styles.formWrapper}>
        <h3>{editingCertificate ? "Edit Certificate" : "Create Certificate"}</h3>
        <form onSubmit={handleCreateOrUpdateCertificate} className={styles.form}>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            required
          >
            <option value="">Select Course</option>
            {editingCertificate && (
              <option value={editingCertificate._id}>
                {editingCertificate.title}
              </option>
            )}
            {coursesWithoutCertificate.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Lectures Required"
            value={minLectures}
            onChange={(e) => setMinLectures(e.target.value)}
            required
          />

          <div className={styles.buttonGroup}>
            <button type="submit">
              {editingCertificate ? "Update Certificate" : "Save Certificate"}
            </button>
            {editingCertificate && (
              <button type="button" className={styles.cancelButton} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 📌 Existing Certificates Table */}
      <h3>Existing Certificates</h3>
      {loading ? (
        <p>Loading...</p>
      ) : coursesWithCertificate.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Course</th>
              <th>Min Lectures Required</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coursesWithCertificate.map((cert) => (
              <tr key={cert._id}>
                <td>{cert.title || "Unknown Course"}</td>
                <td>{cert.minLecturesRequired}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedCourse(cert._id || "");
                      setMinLectures(cert.minLecturesRequired);
                      setEditingCertificate(cert);
                    }}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCertificate(cert.certificateId)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No certificates created yet.</p>
      )}
    </div>
  );
};

export default AdminCertificate;
