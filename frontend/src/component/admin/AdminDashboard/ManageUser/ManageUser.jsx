import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./ManageUser.module.css";
import { API_PORT } from "../../../../../const";

const ManageUsers = () => {
  const PORT = API_PORT;

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });
  const [editUserId, setEditUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        fetchUsersBySearch(searchTerm);
      } else {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${PORT}/api/admin/getUsers`, {
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      window.customAlert("Failed to fetch users. Please try again.");
    }
  };

  const fetchUsersBySearch = async (query) => {
    try {
      const response = await axios.get(
        `${PORT}/api/admin/getUsers?search=${query}`,
        { withCredentials: true }
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      window.customAlert("Failed to fetch users. Please try again.");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddOrEditUser = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      window.customAlert("Please fill in all required fields.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (editUserId) {
        await axios.put(
          `${PORT}/api/admin/updateUser/${editUserId}`,
          formData,
          { withCredentials: true }
        );
        window.customAlert("User updated successfully!");
      } else {
        await axios.post(`${PORT}/api/admin/addUser`, formData, {
          withCredentials: true,
        });
        window.customAlert("User added successfully!");
      }
      setFormData({ name: "", email: "", role: "", password: "" });
      setEditUserId(null);
      fetchUsers();
    } catch (error) {
      console.error("Error adding/updating user:", error);
      window.customAlert("Failed to add/update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "", // Password is not required when editing
    });
  };

  const handleDelete = async (userId) => {
    window.customConfirm("Are you sure you want to delete this user?", async (isConfirmed) => {
  
      if (!isConfirmed) return;
  
      try {
        await axios.delete(`${PORT}/api/admin/deleteUser/${userId}`, {
          withCredentials: true,
        });
  
        window.customAlert("User deleted successfully!", () => {
          fetchUsers();
        });
  
  
      } catch (error) {
        console.error("Error deleting user:", error);
        window.customAlert("Failed to delete user. Please try again.");
      }
    });
  };
  

  const handleCancel = () => {
    setFormData({ name: "", email: "", role: "", password: "" });
    setEditUserId(null);
  };

  return (
    <div className={styles.manageUsersContainer}>
      <h1 className={styles.title}>Manage Users</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.userForm}>
        <h2>{editUserId ? "Edit User" : "Add User"}</h2>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password (Only for new user)"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="">Select Role</option>
          <option value="Admin">Admin</option>
          <option value="Student">Student</option>
        </select>
        <button onClick={handleAddOrEditUser} disabled={loading}>
          {loading ? "Processing..." : editUserId ? "Update User" : "Add User"}
        </button>
        <button onClick={handleCancel} className={styles.cancelButton}>
          Cancel
        </button>
      </div>

      <div className={styles.userData}>
        {users.length > 0 ? (
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(user)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(user._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
