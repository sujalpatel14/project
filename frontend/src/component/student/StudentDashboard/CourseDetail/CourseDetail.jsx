import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_PORT } from "../../../../../const";
import styles from "./CourseDetails.module.css";

const CourseDetails = () => {
  const { courseId } = useParams(); // Get course ID from URL
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackList, setFeedbackList] = useState([]); // Store feedback reviews
  const PORT = API_PORT;

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`${PORT}/api/student/course/${courseId}`, {
          withCredentials: true,
        });
        setCourse(response.data);
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };

    const checkEnrollmentStatus = async () => {
      try {
        const response = await axios.get(`${PORT}/api/student/enrolledCourses`, {
          withCredentials: true,
        });
        const enrolledCourses = response.data.map((course) => course._id.toString());
        setIsEnrolled(enrolledCourses.includes(courseId));
      } catch (error) {
        console.error("Error checking enrollment status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
    checkEnrollmentStatus();
    fetchFeedback();
  }, [courseId]);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`${PORT}/api/student/courseReviews/${courseId}`, {
        withCredentials: true,
      });
      console.log(response.data);
      setFeedbackList(response.data); // Store fetched feedback
    } catch (error) {
      console.error("Error fetching course reviews:", error);
    }
  };

  const handleEnroll = async () => {
    try {
      await axios.post(
        `${PORT}/api/student/enroll`,
        { courseId },
        { withCredentials: true }
      );
      setIsEnrolled(true);
      window.customAlert("You have successfully enrolled in this course!");
    } catch (error) {
      console.error("Error enrolling in course:", error);
      window.customAlert("Failed to enroll in the course.");
    }
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      window.customAlert("Please select a star rating!");
      return;
    }

    try {
      await axios.post(
        `${PORT}/api/student/submitCourseFeedback`,
        { courseId, rating, comment },
        { withCredentials: true }
      );

      window.customAlert("Feedback submitted successfully!");
      setRating(0);
      setComment("");

      // Refresh feedback list after submission
      fetchFeedback();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      window.customAlert("Failed to submit feedback.");
    }
  };

  if (loading) {
    return <p className={styles.loadingText}>Loading course details...</p>;
  }

  if (!course) {
    return <p className={styles.errorText}>Course not found.</p>;
  }

  return (
    <div className={styles.courseContainer}>
      <div className={styles.courseDetail}>
        <img src={course.thumbnail} alt={course.title} className={styles.courseImage} />
        <h1>{course.title}</h1>
        <p>{course.description}</p>

        {isEnrolled ? (
          <p className={styles.enrolledMessage}> You are already enrolled in this course.</p>
        ) : (
          <button className={styles.enrollBtn} onClick={handleEnroll}>
            Enroll Free Now
          </button>
        )}
      </div>

      {/* Feedback Display Section */}
      <section className={styles.feedbackDisplay}>
        <h2>Student Reviews 🗣️</h2>
        <div className={styles.feedbackList}>
          {feedbackList.length > 0 ? (
            feedbackList.map((fb, index) => (
              <div key={index} className={styles.feedbackItem}>
                <div className={styles.userInfo}>
                  {fb.studentId.profilePic ? (
                    <img src={fb.studentId.profilePic} alt="User" className={styles.profilePic} />
                  ) : (
                    <span className={styles.defaultProfile}>👤</span>
                  )}
                  <div>
                    <h4>{fb.studentId.name}</h4>
                    <div className={styles.starDisplay}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={i < fb.rating ? styles.filledStar : styles.emptyStar}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className={styles.feedbackMessage}>{fb.comment}</p>
              </div>
            ))
          ) : (
            <p>No feedback available yet.</p>
          )}
        </div>
      </section>

      {/* Feedback Form */}
      <div className={styles.feedbackForm}>
        <h2>Give Your Feedback</h2>

        <div className={styles.ratingStars}>
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
              <span
                key={starValue}
                className={`${styles.star} ${starValue <= (hover || rating) ? styles.filled : ""}`}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(starValue)}
              >
                ★
              </span>
            );
          })}
        </div>

        <textarea
          className={styles.feedbackTextarea}
          placeholder="Write your feedback..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button className={styles.submitBtn} onClick={handleSubmitFeedback}>
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

export default CourseDetails;
