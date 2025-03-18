import React, { useEffect } from "react";
import {
  Chart,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
} from "chart.js";
import { Pie, Bar, Line, Radar } from "react-chartjs-2";
import styles from "./AdminDashboardCharts.module.css";

// Register required Chart.js components
Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale
);

const DashboardHome = () => {
  // Dummy data for charts
  const userRoleData = {
    labels: ["Students", "Admins"],
    datasets: [
      {
        data: [120, 15],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const courseDifficultyData = {
    labels: ["Beginner", "Intermediate", "Advanced"],
    datasets: [
      {
        label: "Courses by Difficulty",
        data: [40, 25, 10],
        backgroundColor: ["#4BC0C0", "#FF9F40", "#9966FF"],
      },
    ],
  };

  const studentProgressData = {
    labels: ["Course 1", "Course 2", "Course 3", "Course 4"],
    datasets: [
      {
        label: "Average Completion (%)",
        data: [75, 60, 80, 90],
        backgroundColor: "#FF6384",
        borderColor: "#FF6384",
        borderWidth: 1,
      },
    ],
  };

  // const newUsersOverTimeData = {
  //   labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  //   datasets: [
  //     {
  //       label: "New Users",
  //       data: [10, 20, 30, 40, 50],
  //       fill: false,
  //       backgroundColor: "#36A2EB",
  //       borderColor: "#36A2EB",
  //     },
  //   ],
  // };

  const quizPerformanceData = {
    labels: ["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4"],
    datasets: [
      {
        label: "Quizzes Completed",
        data: [5, 8, 10, 6],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  // Component JSX
  return (
    <div className={styles.container}>
      {/* User Role Distribution (Pie Chart) */}
      <div className={styles.chart}>
        <h3>User Role Distribution</h3>
        <Pie data={userRoleData} />
      </div>

      {/* Courses by Difficulty Level (Bar Chart) */}
      <div className={styles.chart}>
        <h3>Courses by Difficulty Level</h3>
        <Bar data={courseDifficultyData} />
      </div>

      {/* Student Progress (Horizontal Bar Chart) */}
      <div className={styles.chart}>
        <h3>Student Progress</h3>
        <Bar
          data={studentProgressData}
          options={{
            indexAxis: "y",
            responsive: true,
          }}
        />
      </div>

      {/* New Users Over Time (Line Chart) */}
      {/* <div className={styles.chart}>
        <h3>New Users Over Time</h3>
        <Line
          data={newUsersOverTimeData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div> */}

      {/* Quiz Performance (Radar Chart) */}
      <div className={styles.chart}>
        <h3>Quiz Performance</h3>
        <Radar
          data={quizPerformanceData}
          options={{
            responsive: true,
          }}
        />
      </div>
    </div>
  );
};

export default DashboardHome;
