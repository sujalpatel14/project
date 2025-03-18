import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import styles from "./Courses.module.css"; 
import axios from "axios";
import { API_PORT } from "../../../../../const";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const PORT = API_PORT;
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => { 
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${PORT}/api/student/getCourses`, { withCredentials: true });
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };


    fetchCourses();
  }, []);

  // Navigate to course detail page on button click
  const handleViewDetails = (courseId) => {
    navigate(`/courses/${courseId}`); // Redirect to the course detail page
  };

  return (
    <div className={styles.coursesContainer}>
      <h1 className={styles.heading}>Explore Our Courses</h1>
      <div className={styles.courseGrid}>
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course._id} className={styles.courseCard}>
              <img src={course.thumbnail} alt={course.title} className={styles.courseThumbnail} />
              <div className={styles.courseContent}>
                <h2 className={styles.courseTitle}>{course.title}</h2>
                <p className={styles.courseDescription}>{course.description}</p>
                <button onClick={() => handleViewDetails(course._id)} className={styles.enrollBtn}>
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.loadingText}>Loading courses...</p>
        )}
      </div>
    </div>
  );
};

export default Courses;
