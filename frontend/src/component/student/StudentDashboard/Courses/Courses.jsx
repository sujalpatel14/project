import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Courses.module.css"; 
import axios from "axios";
import { API_PORT } from "../../../../../const";
import Loader from "../Loader/Loader";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const coursesRef = useRef([]); // Store courses to avoid redundant re-renders
  const [loading , setLoading ] = useState(false);
  const PORT = API_PORT;
  const navigate = useNavigate();

  useEffect(() => { 
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${PORT}/api/student/getCourses`, { withCredentials: true });

        // Prevent unnecessary state updates if data is the same
        if (JSON.stringify(response.data) !== JSON.stringify(coursesRef.current)) {
          coursesRef.current = response.data;
          setCourses(response.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Memoize course list to prevent unnecessary re-calculations
  const memoizedCourses = useMemo(() => courses, [courses]);

  // Memoize navigation function
  const handleViewDetails = useCallback((courseId) => {
    navigate(`/courses/${courseId}`);
  }, [navigate]);

  return (
    <div className={styles.coursesContainer}>
      <h1 className={styles.heading}>Explore Our Courses</h1>
      {loading?(<Loader />):null}
      <div className={styles.courseGrid}>
        {memoizedCourses.length > 0 ? (
          memoizedCourses.map((course) => (
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
          <p className={styles.loadingText}></p>
        )}
      </div>
    </div>
  );
};

export default Courses;
