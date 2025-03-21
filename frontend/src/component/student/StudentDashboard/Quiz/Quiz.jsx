import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Quiz.module.css";
import { API_PORT } from "../../../../../const";

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [score, setScore] = useState(null);
  const [courseTitle, setCourseTitle] = useState();
  const [lessonTitle, setLessonTitle] = useState();
  const PORT = API_PORT;

  useEffect(() => {
    const fetchQuizAndCourses = async () => {
      try {
        // Fetch quiz data
        const quizResponse = await axios.get(
          `${PORT}/api/student/quiz/${quizId}`,
          { withCredentials: true }
        );
        setCourseTitle(quizResponse.data.courseTitle);
        setLessonTitle(quizResponse.data.lessonTitle);
        setQuiz(quizResponse.data.quiz);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAndCourses();
  }, [quizId]);

  const handleOptionChange = (questionIndex, selectedOption) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const handleSubmitQuiz = async () => {
    // **Validation: Ensure all questions are answered**
    if (quiz.questions.length !== Object.keys(selectedAnswers).length) {
      window.customAlert("Please answer all questions before submitting.");
      return;
    }

    try {
      const response = await axios.post(
        `${PORT}/api/student/submitQuiz`,
        { quizId, selectedAnswers },
        { withCredentials: true }
      );

      setMessage(response.data.message);
      setScore(response.data.score);

      // Show marks in alert box
      window.customAlert(`You scored ${response.data.score}%`);

      // Navigate to "My Courses" after alert
      navigate("/my-courses");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setMessage("Failed to submit quiz. Try again.");
    }
  };

  if (loading) return <p>Loading quiz...</p>;
  if (!quiz) return <p>No quiz found for this lesson.</p>;

  return (
    <div className={styles.quizContainer}>
      <div>
        <h2>{courseTitle}</h2>
        <h2>{lessonTitle}</h2>
      </div>

      {/* Quiz Section */}
      <div className={styles.quizContent}>
        <ul className={styles.questionsList}>
          {quiz.questions.map((q, index) => (
            <li key={index} className={styles.questionItem}>
              {/* Preserve line breaks in questions */}
              <h3
                dangerouslySetInnerHTML={{
                  __html: q.questionText.replace(/\n/g, "<br />"),
                }}
              ></h3>

              {q.options.map((option, i) => (
                <label key={i} className={styles.option}>
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    onChange={() => handleOptionChange(index, option)}
                    checked={selectedAnswers[index] === option}
                  />
                  {option}
                </label>
              ))}
            </li>
          ))}
        </ul>

        {message && <p className={styles.message}>{message}</p>}
        {score !== null && <p className={styles.message}>{`You scored ${score}%`}</p>}
        <button className={styles.submitBtn} onClick={handleSubmitQuiz}>
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

export default Quiz;
