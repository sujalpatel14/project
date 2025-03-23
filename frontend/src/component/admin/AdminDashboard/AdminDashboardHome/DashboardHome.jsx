import { useEffect, useState } from "react";
import { Pie, Bar, Radar } from "react-chartjs-2";
import axios from "axios";
import styles from "./AdminDashboardCharts.module.css";
import { API_PORT } from "../../../../../const";

// Register necessary Chart.js components
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

const DashboardHome = () => {
  const PORT = API_PORT;
  const [userRoleData, setUserRoleData] = useState(null);
  const [courseDifficultyData, setCourseDifficultyData] = useState(null);
  const [studentProgressData, setStudentProgressData] = useState(null);
  const [quizPerformanceData, setQuizPerformanceData] = useState(null);
  

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Fetch User Role Distribution Data
        const userRoleRes = await axios.get(`${PORT}/api/admin/user-role-distribution`);
        setUserRoleData(userRoleRes.data);

        // Fetch Course Difficulty Data
        const courseDifficultyRes = await axios.get(`${PORT}/api/admin/course-difficulty`);
        setCourseDifficultyData(courseDifficultyRes.data);

        // Fetch Quiz Performance Data
        const quizPerformanceRes = await axios.get(`${PORT}/api/admin/quiz-performance`);

        if (!quizPerformanceRes.data?.lessonNames || !quizPerformanceRes.data?.quizData) {
          console.error("Invalid Quiz Performance Data:", quizPerformanceRes.data);
        } else {
          const formattedQuizPerformance = {
            labels: quizPerformanceRes.data.lessonNames.map((name, index) => `Lesson ${index + 1}: ${name}`),
            datasets: [
              {
                label: "Number of Questions",
                data: quizPerformanceRes.data.quizData.map((quiz) => quiz.questionCount),
                backgroundColor: [
                  "rgba(255, 99, 132, 0.5)",
                  "rgba(54, 162, 235, 0.5)",
                  "rgba(255, 206, 86, 0.5)",
                  "rgba(75, 192, 192, 0.5)",
                  "rgba(153, 102, 255, 0.5)",
                  "rgba(255, 159, 64, 0.5)",
                  "rgba(0, 128, 0, 0.5)",
                  "rgba(128, 0, 128, 0.5)",
                  "rgba(255, 0, 0, 0.5)",
                  "rgba(0, 0, 255, 0.5)",
                ],
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
              },
            ],
          };

          setQuizPerformanceData(formattedQuizPerformance);
        }

        // Fetch Student Progress Data
        const studentProgressRes = await axios.get(`${PORT}/api/admin/student-progress`);
        setStudentProgressData(studentProgressRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div className={styles.container}>
      {/* User Role Distribution */}
      {userRoleData && userRoleData.datasets?.length > 0 ? (
        <div className={styles.chart}>
          <h3>User Role Distribution</h3>
          <Pie
            data={{
              labels: userRoleData.labels,
              datasets: userRoleData.datasets,
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      ) : (
        <p>No User Role Data Available!</p>
      )}

      {/* Courses by Difficulty Level */}
      {courseDifficultyData ? (
        <div className={styles.chart}>
          <h3>Courses by Difficulty Level</h3>
          <Bar data={courseDifficultyData} />
        </div>
      ) : (
        <p>No Course Difficulty Data Available!</p>
      )}

      {/* Student Progress */}
      {studentProgressData ? (
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
      ) : (
        <p>No Student Progress Data Available!</p>
      )}

      {/* Quiz Performance Chart
      {quizPerformanceData && quizPerformanceData.labels.length > 0 ? (
        <div className={styles.chart}>
          <h3>Quiz Performance</h3>
          <Radar
            data={quizPerformanceData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  beginAtZero: true,
                  suggestedMax: Math.max(...quizPerformanceData.datasets[0].data, 10) + 5,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>
      ) : (
        <p>No Quiz Performance Data Available!</p>
      )} */}
    </div>
  );
};

export default DashboardHome;
