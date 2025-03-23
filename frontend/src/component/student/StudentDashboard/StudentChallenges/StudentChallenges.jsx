import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./StudentChallenges.module.css";
import { useNavigate } from "react-router-dom";
import { API_PORT } from "../../../../../const";

const StudentChallenges = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState(""); 
  const [submitting, setSubmitting] = useState(false); // Prevent multiple clicks
  const challengeRef = useRef(null);
  const [courseTitle, setCourseTitle] = useState(null);
  const PORT = API_PORT;

  // Fetch enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${PORT}/api/student/enrolledCourses`, {
          withCredentials: true,
        });
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  // Fetch challenges based on selected course
  const fetchChallenges = async (courseId, title) => {
    setCourseTitle(title);
    setLoading(true);
    try {
      const { data } = await axios.get(`${PORT}/api/student/challenges`, {
        withCredentials: true,
        params: { courseId }, 
      });
      setChallenges(data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
    setLoading(false);

    // Smooth scroll to challenge list
    setTimeout(() => {
      challengeRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  };

  // Handle selecting a challenge
  const handleSelectChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setUserCode(challenge.starterCode || "");
    setResponseMessage(""); // Reset response message
  };

  // Submit code for a challenge
  const handleSubmitCode = async () => {
    if (submitting) return; // Prevent multiple clicks

    setSubmitting(true); // Disable button while submitting
    setResponseMessage(""); // Reset previous message

    try {
      console.log(selectedChallenge.title, selectedChallenge.description, courseTitle);
      const response = await axios.post(
        `${PORT}/api/student/submit-challenge/${selectedChallenge._id}`,
        {
          code: userCode,
          title: selectedChallenge.title,
          description: selectedChallenge.description,
          language: courseTitle,
        },
        { withCredentials: true }
      );

      setResponseMessage(response.data.message); // Show success message
      fetchChallenges(selectedChallenge.courseId); // Refresh challenges
    } catch (error) {
      if (error.response) {
        window.customAlert(error.response.data.message || "Error submitting code!");
      } else {
        console.error("Error submitting challenge:", error);
        window.customAlert("Something went wrong. Please try again later.");
      }
    }

    setSubmitting(false); // Re-enable button
  };

  // Prevent Copy & Tab Change Detection
  useEffect(() => {
    // Prevent Copy
    const preventCopy = (e) => {
      e.preventDefault();
      window.customAlert("Copying is disabled on this page.");
    };

    document.addEventListener("copy", preventCopy);
    document.addEventListener("contextmenu", preventCopy);
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && (e.key === "c" || e.key === "x" || e.key === "a")) {
        preventCopy(e);
      }
    });

    // Detect Tab Change & Redirect
    const handleTabChange = () => {
      if (document.hidden) {
        window.customAlert("Tab switching is not allowed! Redirecting...");
        navigate("/challenges");
      }
    };

    document.addEventListener("visibilitychange", handleTabChange);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("contextmenu", preventCopy);
      document.removeEventListener("keydown", preventCopy);
      document.removeEventListener("visibilitychange", handleTabChange);
    };
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Student Challenges</h2>

      {/* Course Selection */}
      <div className={styles.coursesContainer}>
        <div className={styles.courseGrid}>
          {courses.length > 0 ? (
            courses.map((course) => (
              <div
                key={course._id}
                className={styles.courseCard}
                onClick={() => fetchChallenges(course._id, course.title)}
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className={styles.courseThumbnail}
                />
                <div className={styles.courseContent}>
                  <h2 className={styles.courseTitle}>{course.title}</h2>
                  <p className={styles.courseDescription}>{course.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.loadingText}>Loading courses...</p>
          )}
        </div>
      </div>
      <hr />

      {loading && <p className={styles.loading}>Loading...</p>}

      {/* Challenge List */}
      {selectedChallenge ? (
        <div className={styles.challengeDetails} ref={challengeRef}>
          <button
            onClick={() => setSelectedChallenge(null)}
            className={styles.backButton}
          >
            ← Back to Challenges
          </button>
          <h3>{selectedChallenge.title}</h3>
          <p>{selectedChallenge.description}</p>
          <p>
            <strong>Difficulty:</strong> {selectedChallenge.difficulty}
          </p>

          {/* Display Test Cases */}
          {selectedChallenge.testCases.length > 0 && (
            <div className={styles.testCasesContainer}>
              <h4>Test Cases:</h4>
              {selectedChallenge.testCases.map((testCase, index) => (
                <div key={index} className={styles.testCase}>
                  <p>
                    <strong>Input:</strong> {testCase.input}
                  </p>
                  <p>
                    <strong>Expected Output:</strong> {testCase.expectedOutput}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Code Input Textarea */}
          <textarea
            className={styles.textarea}
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            rows="8"
            placeholder="Write your code here..."
          ></textarea>

          {/* Prevent multiple clicks with disabled state */}
          <button 
            onClick={handleSubmitCode} 
            className={styles.submitButton} 
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Code"}
          </button>

          {/* Show response message */}
          {responseMessage && (
            <p className={styles.responseMessage}>{responseMessage}</p>
          )}
        </div>
      ) : (
        <div>
          <h3>{courseTitle}</h3>
          <div className={styles.challengeList} ref={challengeRef}>
            {challenges.length > 0 ? (
              challenges.map((challenge) => (
                <div key={challenge._id} className={styles.challengeCard}>
                  <h3>{challenge.title}</h3>
                  <p>{challenge.description}</p>

                  <button
                    onClick={() => handleSelectChallenge(challenge)}
                    className={styles.joinButton}
                  >
                    Attempt Challenge
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.noChallenges}>No challenges available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentChallenges;
