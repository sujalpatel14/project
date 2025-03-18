import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./ManageLessons.module.css";
import { API_PORT } from "../../../../../const";

const ManageLessons = () => {
  const PORT = API_PORT;
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    content: "",
    videoUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [loading, setLoading] = useState(false); // 🔄 Prevent multiple clicks
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesRes = await axios.get(`${PORT}/api/admin/getCourses`, {
          withCredentials: true,
        });
        setCourses(coursesRes.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch lessons for a selected course
  const fetchLessons = async (courseId) => {
    try {
      const lessonsRes = await axios.get(`${PORT}/api/admin/getLessons/${courseId}`, {
        withCredentials: true,
      });
      setLessons(lessonsRes.data);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    }
  };

  // Handle course selection change
  const handleCourseChange = (e) => {
    const { value } = e.target;
    setForm({ ...form, courseId: value });
    if (value) {
      fetchLessons(value); // Fetch lessons for the selected course
    } else {
      setLessons([]); // Clear lessons if no course is selected
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error when user types
  };

  // Form Validation
  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    if (!form.courseId) {
      newErrors.courseId = "Please select a course.";
      isValid = false;
    }
    if (!form.title.trim()) {
      newErrors.title = "Title is required.";
      isValid = false;
    }
    if (!form.content.trim()) {
      newErrors.content = "Content is required.";
      isValid = false;
    }
    if (form.videoUrl && !/^https?:\/\/.+\..+$/.test(form.videoUrl)) {
      newErrors.videoUrl = "Invalid URL format.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Add or Edit a Lesson
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || loading) return;

    setLoading(true);
    try {
      if (isEditing) {
        // Update existing lesson
        await axios.put(`${PORT}/api/admin/lessons/${editingLessonId}`, form, {
          withCredentials: true,
        });
        setLessons((prev) =>
          prev.map((lesson) =>
            lesson._id === editingLessonId ? { ...lesson, ...form } : lesson
          )
        );
      } else {
        // Add new lesson
        const { data } = await axios.post(`${PORT}/api/admin/addLesson`, form, {
          withCredentials: true,
        });
        setLessons([...lessons, data]);
      }
      resetForm();
    } catch (err) {
      console.error("Error submitting lesson:", err);
      alert("Failed to submit lesson.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel Edit
  const handleCancel = () => {
    resetForm();
  };

  // Edit a Lesson
  const handleEdit = (lesson) => {
    setIsEditing(true);
    setEditingLessonId(lesson._id);
    setForm({
      courseId: lesson.courseId,
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
    });
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // Delete a Lesson
  const handleDelete = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    setLoading(true);
    try {
      await axios.delete(`${PORT}/api/admin/lessons/${lessonId}`, {
        withCredentials: true,
      });
      setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Failed to delete lesson.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ courseId: "", title: "", content: "", videoUrl: "" });
    setIsEditing(false);
    setEditingLessonId(null);
  };

  return (
    <div className={styles.manageLessons}>
      <h1>Manage Lessons</h1>

      {/* Form for Adding/Editing a Lesson */}
      <div ref={formRef} className={styles.addLesson}>
        <form onSubmit={handleSubmit}>
          <h2>{isEditing ? "Edit Lesson" : "Add Lesson"}</h2>
          <select name="courseId" value={form.courseId} onChange={handleCourseChange} required>
            <option value="">-- Select a Course --</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
          {errors.courseId && <p className={styles.error}>{errors.courseId}</p>}

          <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
          {errors.title && <p className={styles.error}>{errors.title}</p>}

          <textarea name="content" value={form.content} onChange={handleChange} placeholder="Content" rows="5" required />
          {errors.content && <p className={styles.error}>{errors.content}</p>}

          <input type="url" name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="Video URL" />
          {errors.videoUrl && <p className={styles.error}>{errors.videoUrl}</p>}

          <div className={styles.formActions}>
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : isEditing ? "Update Lesson" : "Add Lesson"}
            </button>
            {isEditing && <button type="button" onClick={handleCancel} className={styles.cancelButton}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* Display Lessons */}
      <div className={styles.lessonList}>
        {lessons.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson._id}>
                  <td>{lesson.title}</td>
                  <td>{courses.find((c) => c._id === lesson.courseId)?.title || "Unknown Course"}</td>
                  <td>
                    <button onClick={() => handleEdit(lesson)} disabled={loading}>Edit</button>
                    <button onClick={() => handleDelete(lesson._id)} disabled={loading}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No Lesson Found</p>}
      </div>
    </div>
  );
};

export default ManageLessons;
