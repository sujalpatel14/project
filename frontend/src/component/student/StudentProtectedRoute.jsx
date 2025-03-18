import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import { API_PORT } from "../../../const";
const PORT = API_PORT;

const StudentProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initially null to avoid flickering

  useEffect(() => {
    // Verify authentication by checking token in cookies
    const verifyAuth = async () => {
      try {
        const response = await axios.get(`${PORT}/api/student/auth-check`, { withCredentials: true });
        setIsAuthenticated(response.data.authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show loading until auth status is confirmed
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default StudentProtectedRoute;
