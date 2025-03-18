// Import necessary modules
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AdminDashboard from './component/admin/AdminDashboard/AdminDashboard';
import AdminLogin from './component/admin/AdminLogin/AdminLogin';
import Registration from './component/student/Registration/Registration';
import Login from './component/student/Login/Login';
import ForgetPassword from './component/student/ForgetPassword/ForgetPassword';
import StudentDashboard from './component/student/StudentDashboard/StudentDashboard';
import AdminProtectedRoute from './component/admin/AdminProtectedRoute';
// import StudentProtectedRoute from './component/student/StudentProtectedRoute';


function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Admin Route */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Student Route */}
          <Route path="/Sign-Up" element={<Registration />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/ForgetPassword" element={<ForgetPassword />} />
          <Route path="/*" element={<StudentDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
