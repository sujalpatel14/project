import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Challenges.module.css";
import { API_PORT } from "../../../../../const";

const ManageChallenges = () => {
  const PORT = API_PORT;
  const [challenges, setChallenges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    starterCode: "",
    testCases: [{ input: "", expectedOutput: "" }],
    difficulty: "Easy",
  });
  const [editingId, setEditingId] = useState(null);
  const [edit , setEdit] = useState(false);

  // Fetch challenges & courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesResponse = await axios.get(`${PORT}/api/admin/getCourses`);
        setCourses(coursesResponse.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.courseId) {
      fetchChallenges();
    } else {
      setChallenges([]); // Clear challenges if no course is selected
    }
  }, [formData.courseId]);

  const fetchChallenges = async () => {
    try {
      const response = await axios.get(
        `${PORT}/api/admin/getChallenges/${formData.courseId}`
      );
      setChallenges(response.data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle test case change
  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...formData.testCases];
    updatedTestCases[index][field] = value;
    setFormData({ ...formData, testCases: updatedTestCases });
  };

  // Add a new test case
  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: "", expectedOutput: "" }],
    });
  };

  // Remove a test case
  const removeTestCase = (index) => {
    const updatedTestCases = formData.testCases.filter((_, i) => i !== index);
    setFormData({ ...formData, testCases: updatedTestCases });
  };

  // Add or Update Challenge
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update challenge
        await axios.put(`${PORT}/api/admin/updateChallenges/${editingId}`, formData);
        window.customAlert("Challenge updated successfully!");
  
      } else {
        //Add challenge
        await axios.post(`${PORT}/api/admin/challenges`, formData);
        window.customAlert("Challenge added successfully!");
      }
  
      fetchChallenges();
      setEditingId(null); // Reset editingId for new challenge creation
      setFormData({
        courseId: formData.courseId,
        title: "",
        description: "",
        starterCode: "",
        testCases: [{ input: "", expectedOutput: "" }],
        difficulty: "Easy",
      });
    } catch (error) {
      console.error("Error saving challenge", error);
      window.customAlert("Error saving challenge");
    }
  };
  

  // Edit Challenge
  const handleEdit = (challenge) => {
    setEdit(true);
    setEditingId(challenge._id);
    setFormData({
      courseId: challenge.courseId._id, 
      title: challenge.title,
      description: challenge.description,
      starterCode: challenge.starterCode,
      testCases: challenge.testCases,
      difficulty: challenge.difficulty,
    });
  };

  // Delete Challenge
  const handleDelete = async (id) => {
    window.customConfirm(
      "Are you sure you want to delete this challenge?",
      async (isConfirmed) => {
        if (!isConfirmed) return; // If user clicks "No", exit
  
        try {
          await axios.delete(`${PORT}/api/admin/deleteChallenge/${id}`, {
            withCredentials: true,
          });
  
          setChallenges((prevChallenges) =>
            prevChallenges.filter((challenge) => challenge._id !== id)
          );
  
          // Ensure user sees alert before proceeding
          window.customAlert("Challenge deleted successfully!", () => {
            console.log("User acknowledged the alert");
          });
  
        } catch (error) {
          console.error("Error deleting challenge", error);
          window.customAlert("Error deleting challenge");
        }
      }
    );
  };
  
  

  const cancel = () => {
    setEdit(false);
    setEditingId(null);
    setFormData({
      courseId: "",
      title: "",
      description: "",
      starterCode: "",
      testCases: [{ input: "", expectedOutput: "" }],
      difficulty: "Easy",
    });
  };
  return (
    <div className={styles.container}>
      <h1>Manage Challenges</h1>

      {/* Challenge Form */}
      <form onSubmit={handleSubmit}>
        <h2>{!edit?"Add":"Edit"} Challenges</h2>
        <select
          name="courseId"
          value={formData.courseId}
          onChange={handleChange}
          required
        >
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <textarea
          name="starterCode"
          placeholder="Starter Code"
          value={formData.starterCode}
          onChange={handleChange}
          required
        />
        <select
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Test Cases */}
        <h3>Test Cases</h3>
        {formData.testCases.map((testCase, index) => (
          <div key={index} className={styles.testCase}>
            <input
              type="text"
              placeholder="Input"
              value={testCase.input}
              onChange={(e) =>
                handleTestCaseChange(index, "input", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Expected Output"
              value={testCase.expectedOutput}
              onChange={(e) =>
                handleTestCaseChange(index, "expectedOutput", e.target.value)
              }
            />
            <button
              type="button"
              onClick={() => removeTestCase(index)}
              className={styles.button}
              style={{ background: "red" }}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addTestCase} className={styles.button}>
          Add Test Case
        </button>

        <button type="submit" className={styles.button}>
          {editingId ? "Update Challenge" : "Add Challenge"}
        </button>

        <button type="button" onClick={cancel} className={styles.button}>
          Cancel
        </button>
      </form>

      {/* Challenge List (Table Format) */}
      {challenges.length > 0 ? (
        <div className={styles.data}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Difficulty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((challenge) => (
                <tr key={challenge._id}>
                  <td>{challenge.title}</td>
                  <td>{challenge.courseId.title}</td>
                  <td>{challenge.difficulty}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(challenge)}
                      className={styles.button}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(challenge._id)}
                      className={styles.button}
                      style={{ background: "#dc3545" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No Data Found</p>
      )}
    </div>
  );
};

export default ManageChallenges;
