import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./ManageCourses.module.css";
import { API_PORT } from "../../../../../const";

const ManageCourses = () => {
  const PORT = API_PORT;
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    difficulty: "",
    category: "",
    image: null, // ✅ Added image field
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ Prevent multiple clicks
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${PORT}/api/admin/getCourses`, {
        withCredentials: true,
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse({ ...newCourse, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewCourse({ ...newCourse, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // ✅ Prevent multiple clicks
    setLoading(true);

    const formData = new FormData();
    formData.append("title", newCourse.title);
    formData.append("description", newCourse.description);
    formData.append("difficulty", newCourse.difficulty);
    formData.append("category", newCourse.category);
    if (newCourse.image) {
      formData.append("image", newCourse.image);
    }

    try {
      if (editingCourse) {
        await axios.put(`${PORT}/api/admin/updateCourse/${editingCourse._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        setEditingCourse(null);
        window.customAlert("Course updated successfully!");
      } else {
        const response = await axios.post(`${PORT}/api/admin/addCourse`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        setCourses([...courses, response.data]);
        window.customAlert("Course added successfully!");
      }
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error("Error submitting course:", error);
      window.customAlert("Failed to submit course.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewCourse({
      title: "",
      description: "",
      difficulty: "",
      category: "",
      image: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setNewCourse({
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      category: course.category,
      image: null, // ✅ Reset image for update
    });
  };

  const handleCancelUpdate = () => {
    setEditingCourse(null);
    resetForm();
  };

  const handleDeleteCourse = async (courseId) => {
    window.customConfirm("Are you sure you want to delete this course?", async (isConfirmed) => {
      if (!isConfirmed) return; // User clicked "No"
  
      setLoading(true);
  
      try {
        await axios.delete(`${PORT}/api/admin/deleteCourse/${courseId}`, {
          withCredentials: true,
        });
  
        setCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseId));
  
        //Wait until user clicks OK before continuing
        window.customAlert("Course deleted successfully!");
  
      } catch (error) {
        console.error("Error deleting course:", error);
        window.customAlert("Failed to delete course.");
      } finally {
        setLoading(false);
      }
    });
  };
  

  return (
    <div className={styles.manageCoursesContainer}>
      <h1 className={styles.title}>Manage Courses</h1>

      <form className={styles.courseForm} onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>{editingCourse ? "Edit Course" : "Add New Course"}</h2>
        <input type="text" name="title" placeholder="Course Title" value={newCourse.title} onChange={handleInputChange} required />
        <textarea name="description" placeholder="Course Description" value={newCourse.description} onChange={handleInputChange} required />
        <input type="text" name="difficulty" placeholder="Difficulty (e.g., Beginner, Intermediate)" value={newCourse.difficulty} onChange={handleInputChange} required />
        <input type="text" name="category" placeholder="Category" value={newCourse.category} onChange={handleInputChange} required />
        <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : editingCourse ? "Update Course" : "Add Course"}
        </button>
        {editingCourse && (
          <button type="button" onClick={handleCancelUpdate} className={styles.cancelButton}>
            Cancel
          </button>
        )}
      </form>

      {loading ? <p>Loading courses...</p> : (
        <div className={styles.courseData}>
          <table className={styles.courseTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Difficulty</th>
                <th>Category</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>{course.title}</td>
                  <td>{course.description}</td>
                  <td>{course.difficulty}</td>
                  <td>{course.category}</td>
                  <td>
                    {course.thumbnail && <img src={`${course.thumbnail}`} alt="Course" width="100" />}
                  </td>
                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditCourse(course)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteCourse(course._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
