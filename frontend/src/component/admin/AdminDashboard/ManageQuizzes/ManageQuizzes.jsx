import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./ManageQuizzes.module.css";
import { API_PORT } from "../../../../../const";

const ManageQuizzes = () => {
  const PORT = API_PORT;
  const [courses, setCourses] = useState([]); // Added courses state
  const [lessons, setLessons] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(""); // Added state for selected course
  const [selectedLesson, setSelectedLesson] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [quizForm, setQuizForm] = useState({
    lessonId: "",
    questions: [
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const formRef = useRef(null);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesRes = await axios.get(`${PORT}/api/admin/getCourses`);
        setCourses(coursesRes.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch lessons based on selected course
  useEffect(() => {
    fetchLessons();

    fetchQuizzes();
  }, [selectedCourse]);

  const fetchLessons = async () => {
    if (selectedCourse) {
      try {
        const lessonsRes = await axios.get(
          `${PORT}/api/admin/getLessonsWithoutQuizzes/${selectedCourse}`
        );
        setLessons(lessonsRes.data);
      } catch (err) {
        console.error("Error fetching lessons:", err);
      }
    } else {
      setLessons([]);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const quizzesRes = await axios.get(
        `${PORT}/api/admin/getQuizzes/${selectedCourse}`
      );
      setQuizzes(quizzesRes.data);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    }
  };
  // Handle course selection
  const handleCourseChange = (e) => {
    const { value } = e.target;
    setSelectedCourse(value);
    setSelectedLesson(""); // Reset lesson when course changes
    setQuizzes([]); // Clear quizzes when course changes
  };

  // Handle lesson selection
  const handleLessonChange = (e) => {
    const { value } = e.target;
    setSelectedLesson(value);
  };

  // Handle quiz form input changes
  const handleQuizFormChange = (e, index, field) => {
    const { name, value } = e.target;
    if (field === "questionText" || field === "correctAnswer") {
      setQuizForm((prev) => {
        const updatedQuestions = [...prev.questions];
        updatedQuestions[index][field] = value;
        return { ...prev, questions: updatedQuestions };
      });
    } else if (field === "options") {
      setQuizForm((prev) => {
        const updatedQuestions = [...prev.questions];
        updatedQuestions[index].options[name] = value;
        return { ...prev, questions: updatedQuestions };
      });
    }
  };

  // Add a question to the form
  const addQuestion = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
        },
      ],
    }));
  };

  // Remove a question from the form
  const removeQuestion = (index) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission (Add or Edit quiz)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Update existing quiz
        await axios.put(
          `${PORT}/api/admin/updateQuiz/${editingQuizId}`,
          quizForm
        );
        setQuizzes((prev) =>
          prev.map((quiz) =>
            quiz._id === editingQuizId ? { ...quiz, ...quizForm } : quiz
          )
        );
        window.customAlert("Quizz updated successfully.");
      } else {
        // Add new quiz
        const { data } = await axios.post(`${PORT}/api/admin/addQuiz`, {
          ...quizForm,
          lessonId: selectedLesson,
        });
        setQuizzes([...quizzes, data]);
        window.customAlert("Quizz Added successfully.");
        fetchLessons();
      }
      setQuizForm({
        lessonId: "",
        questions: [
          { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
        ],
      });
      setIsEditing(false);
      setEditingQuizId(null);
    } catch (err) {
      console.error("Error submitting quiz:", err);
    }
  };

  // Edit quiz
  const handleEdit = (quiz) => {
    setIsEditing(true);
    setEditingQuizId(quiz._id);
    setQuizForm(quiz);
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // Delete quiz
  const handleDelete = async (quizId) => {
    window.customConfirm("Are you sure you want to delete this quiz?", async (isConfirmed) => {
      if (!isConfirmed) return; // User clicked "No"
  
      try {
        await axios.delete(`${PORT}/api/admin/deleteQuiz/${quizId}`, { withCredentials: true });
  
        setQuizzes((prev) => prev.filter((quiz) => quiz._id !== quizId));
        window.customAlert("Quiz deleted successfully!", () => {
          fetchLessons(); // Reload lessons after deletion
        });
  
      } catch (err) {
        console.error("Error deleting quiz:", err);
        window.customAlert("Failed to delete quiz.");
      }
    });
  };
  

  return (
    <div className={styles.manageQuizzes}>
      <h1>Manage Quizzes</h1>

      {/* Select Course */}
      <div className={styles.selectCourse}>
        <select value={selectedCourse} onChange={handleCourseChange}>
          <option value="">-- Select a Course --</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Select Lesson */}
      <div className={styles.selectLesson}>
        <select
          value={selectedLesson}
          onChange={handleLessonChange}
          disabled={!selectedCourse}
        >
          <option value="">-- Select a Lesson --</option>
          {lessons.map((lesson) => (
            <option key={lesson._id} value={lesson._id}>
              {lesson.title}
            </option>
          ))}
        </select>
      </div>

      {/* Quiz Form */}
      <div ref={formRef} className={styles.quizForm}>
        <form onSubmit={handleSubmit}>
          <h2>{isEditing ? "Edit Quiz" : "Add Quiz"}</h2>
          {quizForm.questions.map((question, index) => (
            <div key={index} className={styles.question}>
              <textarea
                placeholder="Enter question text"
                value={question.questionText}
                onChange={(e) => handleQuizFormChange(e, index, "questionText")}
                required
              />
              <div className={styles.options}>
                {question.options.map((option, optIndex) => (
                  <input
                    key={optIndex}
                    placeholder={`Option ${optIndex + 1}`}
                    name={optIndex}
                    value={option}
                    onChange={(e) => handleQuizFormChange(e, index, "options")}
                    required
                  />
                ))}
              </div>
              <input
                placeholder="Correct Answer"
                value={question.correctAnswer}
                onChange={(e) =>
                  handleQuizFormChange(e, index, "correctAnswer")
                }
                required
              />
              <button type="button" onClick={() => removeQuestion(index)} style={{ background: "#dc3545" }}>
                Remove Question
              </button>
            </div>
          ))}
          <button type="button" onClick={addQuestion}>
            Add Question
          </button>
          <button type="submit">
            {isEditing ? "Update Quiz" : "Add Quiz"}
          </button>
        </form>
      </div>

      {/* Display Quizzes */}
      {quizzes.length > 0 ? (
        <div className={styles.quizList}>
          <table>
            <thead>
              <tr>
                <th>Lesson</th>
                <th>Number of Questions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz._id}>
                  <td>{quiz.lessonId.title || "Unknown Lesson"}</td>
                  <td>{quiz.questions.length}</td>
                  <td>
                    <button onClick={() => handleEdit(quiz)}>Edit</button>
                    <button onClick={() => handleDelete(quiz._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No quizzes found.</p>
      )}
    </div>
  );
};

export default ManageQuizzes;
