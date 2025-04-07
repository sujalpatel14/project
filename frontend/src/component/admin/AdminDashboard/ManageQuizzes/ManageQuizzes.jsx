import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./ManageQuizzes.module.css";
import { API_PORT } from "../../../../../const";
import * as XLSX from "xlsx";

const ManageQuizzes = () => {
  const PORT = API_PORT;
  const [courses, setCourses] = useState([]); // Added courses state
  const [lessons, setLessons] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(""); // Added state for selected course
  const [selectedLesson, setSelectedLesson] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const fileInputRef = useRef(null);
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
        const coursesRes = await axios.get(`${PORT}/api/admin/getCourses`, { withCredentials: true });
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
          `${PORT}/api/admin/getLessonsWithoutQuizzes/${selectedCourse}`, { withCredentials: true }
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
        `${PORT}/api/admin/getQuizzes/${selectedCourse}`, { withCredentials: true }
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

  // Function to handle Excel upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Convert JSON data into the quiz structure
      const formattedData = jsonData.map((row) => ({
        questionText: row["Question"],
        options: [row["Option A"], row["Option B"], row["Option C"], row["Option D"]],
        correctAnswer: row["Correct Answer"],
      }));

      // Set quiz data to state for display
      setQuizForm((prev) => ({
        ...prev,
        questions: formattedData,
      }));      
    };

    reader.readAsArrayBuffer(file);
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
  
    // Validate only on Add (not Edit)
    if (!isEditing) {
      if (!selectedCourse) {
        window.customAlert("Please select a course.");
        return;
      }
      if (!selectedLesson) {
        window.customAlert("Please select a lesson.");
        return;
      }
      if (!quizForm.questions.length) {
        window.customAlert("Please add at least one question.");
        return;
      }
  
      for (let i = 0; i < quizForm.questions.length; i++) {
        const q = quizForm.questions[i];
        if (!q.questionText.trim()) {
          window.customAlert(`Question ${i + 1} is missing a question text.`);
          return;
        }
        if (q.options.some((opt) => !opt.trim())) {
          window.customAlert(`All options must be filled for Question ${i + 1}.`);
          return;
        }
        if (!q.correctAnswer.trim()) {
          window.customAlert(`Please provide the correct answer for Question ${i + 1}.`);
          return;
        }
      }
    }
  
    try {
      if (isEditing) {
        await axios.put(`${PORT}/api/admin/updateQuiz/${editingQuizId}`, quizForm, { withCredentials: true });
        setQuizzes((prev) =>
          prev.map((quiz) =>
            quiz._id === editingQuizId ? { ...quiz, ...quizForm } : quiz
          )
        );
        window.customAlert("Quiz updated successfully.");
      } else {
        const { data } = await axios.post(`${PORT}/api/admin/addQuiz`, {
          ...quizForm,
          lessonId: selectedLesson,
        }, { withCredentials: true });
        setQuizzes([...quizzes, data]);
        window.customAlert("Quiz added successfully.");
        fetchLessons();
      }
  
      // Reset form state
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
      window.customAlert("Something went wrong while submitting the quiz.");
    }
  };
  
  const cancel = ()=>{
    setQuizForm({
      lessonId: "",
      questions: [
        { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
      ],
    });
    setIsEditing(false);
  }

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

      <div className={styles.uploadSection}>
        <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} />
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
          <button type="button" onClick={cancel}>Cancel</button>
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
