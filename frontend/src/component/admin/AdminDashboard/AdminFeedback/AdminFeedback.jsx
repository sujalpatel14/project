import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AdminFeedback.module.css"; // Import module CSS
import { API_PORT } from "../../../../../const.js";

const AdminFeedback = () => {
    const PORT = API_PORT;
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Default: today

  useEffect(() => {
    fetchFeedback(selectedDate);
  }, [selectedDate]);

  const fetchFeedback = async (date) => {
    try {
      const response = await axios.get(`${PORT}/api/admin/feedback?date=${date}`, { withCredentials: true });
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Feedback Management</h2>

      {/* Date Picker */}
      <div className={styles.dateFilter}>
        <label>Select Date: </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={styles.dateInput}
        />
      </div>

      {/* Feedback List */}
      <div className={styles.feedbackList}>
        {feedbacks.length > 0 ? (
          feedbacks.map((feedback) => (
            <div key={feedback._id} className={styles.feedbackCard}>
              <h4 className={styles.name}>{feedback.name}</h4>
              <p className={styles.email}>{feedback.email}</p>
              <p className={styles.message}>{feedback.message}</p>
              <div className={styles.rating}>
                Rating: {"★".repeat(feedback.rating)}
              </div>
              <span className={styles.date}>
                {new Date(feedback.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p className={styles.noFeedback}>
            No feedback available for this date.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
