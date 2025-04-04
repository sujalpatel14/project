import { useState } from "react";
import axios from "axios";
import { Pie, Doughnut } from "react-chartjs-2";
import "chart.js/auto"; // Required for Chart.js v3+
import styles from "./MonitorStudentProgress.module.css";
import { API_PORT } from "../../../../../const";

const MonitorStudentProgress = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const PORT = API_PORT;

  const fetchStudentProgress = async () => {
    if (!searchTerm.trim()) {
      window.customAlert("Please enter an email or name.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(
        `${PORT}/api/admin/student_progress?search=${searchTerm}`,
        { withCredentials: true }
      );
      setStudent(data);
    } catch (error) {
      console.error("Error fetching student progress:", error);
      window.customAlert("Student not found or an error occurred.");
      setStudent(null);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Monitor Student Progress</h2>

      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Enter student email or name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <button onClick={fetchStudentProgress} className={styles.searchButton}>
          Search
        </button>
      </div>

      {loading && <p className={styles.loading}>Loading...</p>}

      {student && (
        <div className={styles.profileCard}>
          <img
            src={student.profilePic || "/default-avatar.png"}
            alt="Profile"
            className={styles.profilePic}
          />
          <h3 className={styles.studentName}>{student.name}</h3>
          <p className={styles.email}>{student.email}</p>

          <div className={styles.progressSection}>
            <h4>Course Progress</h4>
            {student.progress.length > 0 ? (
              student.progress.map((course) => (
                <div key={course.courseId._id} className={styles.courseCard}>
                  <h5>{course.courseId.title}</h5>
                  <p>
                    Completion: <strong>{course.completionPercentage}%</strong>
                  </p>

                  {/* 📌 Pie Chart for Completion */}
                  <div className={styles.chartContainer}>
                    <Pie
                      data={{
                        labels: ["Completed", "Remaining"],
                        datasets: [
                          {
                            data: [
                              course.completionPercentage,
                              100 - course.completionPercentage,
                            ],
                            backgroundColor: ["#4caf50", "#f44336"],
                          },
                        ],
                      }}
                    />
                  </div>

                  {/* 📌 Doughnut Chart for Lesson Completion */}
                  <div className={styles.chartContainer}>
                    <Doughnut
                      data={{
                        labels: course.completedLessons.map(
                          (lesson) => lesson.title
                        ),
                        datasets: [
                          {
                            data: course.completedLessons.map(() => 1), // Each lesson counts as 1
                            backgroundColor: [
                              "#ff9800",
                              "#3f51b5",
                              "#009688",
                              "#e91e63",
                            ],
                          },
                        ],
                      }}
                    />
                  </div>

                  {/* 📌 List of Completed Lessons */}
                  <p>Completed Lessons:</p>
                  <ul className={styles.lessonList}>
                    {course.completedLessons.length > 0 ? (
                      course.completedLessons.map((lesson, index) => (
                        <li key={index}>{lesson.title}</li>
                      ))
                    ) : (
                      <li>No lessons completed yet.</li>
                    )}
                  </ul>
                </div>
              ))
            ) : (
              <p className={styles.noProgress}>No progress data available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorStudentProgress;
