import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./MyCourses.module.css"; 
import { API_PORT } from "../../../../../const";
import Loader from "../Loader/Loader";

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [coursesFetched, setCoursesFetched] = useState(false); // Track fetch status
  const coursesRef = useRef(false); // Prevent multiple API calls
  const [loading , setLoading ] = useState(false);
  const PORT = API_PORT;
  const navigate = useNavigate();
  const lessonsRef = useRef(null);

  useEffect(() => {
    // Prevent re-fetch if data is already fetched
    if (coursesRef.current) return;

    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${PORT}/api/student/enrolledCourses`, { withCredentials: true });
        setEnrolledCourses(response.data);
        setCoursesFetched(true);
        coursesRef.current = true; // Mark data as fetched
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      }finally{
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const handleFetchLessons = async (courseId) => {
    setSelectedCourse(courseId);
    setLoadingLessons(true);

    try {
      const lessonResponse = await axios.get(`${PORT}/api/student/${courseId}/lessons`, { withCredentials: true });
      setLessons(lessonResponse.data);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoadingLessons(false);
    }

    setTimeout(() => {
      lessonsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const handlePlayVideo = (lessonId) => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleExploreCourses = () => {
    navigate("/courses");
  };

  return (
    <div className={styles.container}>
      <h1>My Courses</h1>

      {loading?(<Loader />):null}

      {coursesFetched && enrolledCourses.length === 0 ? (
        <div className={styles.noCourses}>
          <p>You have no enrolled courses.</p>
          <button className={styles.exploreBtn} onClick={handleExploreCourses}>
            Explore Courses
          </button>
        </div>
      ) : (
        <div className={styles.courseGrid}>
          {enrolledCourses.map((course) => (
            <div key={course._id} className={styles.courseCard}>
              <img src={course.thumbnail} alt="Course Thumbnail" />
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <button 
                className={styles.fetchLessonsBtn} 
                onClick={() => handleFetchLessons(course._id)}
              >
                Start Learning
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedCourse && (
        <div className={styles.courseDetails} ref={lessonsRef}>
          <hr />
          <h2>Lessons & Quizzes</h2>

          {loadingLessons ? (
            <p>Loading lessons...</p>
          ) : lessons.length > 0 ? (
            <ul className={styles.lessonList}>
              {lessons.map((lesson) => (
                <li key={lesson._id} className={`${styles.lessonCard} ${lesson.isUnlocked ? "" : styles.lockedLesson}`}>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.content}</p>

                  {lesson.quiz ? (
                    <>
                      <div className={styles.quiz}>
                        <h4>Video: {lesson.quiz.title}</h4>
                        <p>{lesson.quiz.description}</p>
                        {lesson.isUnlocked ? (
                          <button className={styles.startVideoBtn} onClick={() => handlePlayVideo(lesson._id)}>
                            Play Video
                          </button>
                        ) : (
                          <button className={styles.lockedBtn} disabled>Locked</button>
                        )}
                      </div>
                      <div className={styles.quiz}>
                        <h4>Quiz: {lesson.quiz.title}</h4>
                        <p>{lesson.quiz.description}</p>
                        {lesson.isUnlocked ? (
                          <button className={styles.startQuizBtn} onClick={() => handleStartQuiz(lesson.quiz._id)}>
                            Start Quiz
                          </button>
                        ) : (
                          <button className={styles.lockedBtn} disabled>Locked</button>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className={styles.noQuiz}>No video or quiz available for this lesson</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No lessons available for this course.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
