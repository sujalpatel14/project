import { useState , useEffect } from "react";
import styles from "./Home.module.css"; // Import CSS module
import { Link } from "react-router-dom";
import axios from "axios";
import { API_PORT } from "../../../../../const.js"

const Home = (props) => {
  const PORT = API_PORT;
  const [feedback, setFeedback] = useState({
    name: "",
    email: "",
    message: "",
    rating: 0, // New state for star rating
  });
  const [feedbackList, setFeedbackList] = useState([]);

  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  // Function to handle star rating selection
  const handleRating = (value) => {
    setFeedback({ ...feedback, rating: value });
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(`${PORT}/api/student/getFeedback`);
        setFeedbackList(response.data);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedback();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !feedback.name ||
      !feedback.email ||
      !feedback.message ||
      feedback.rating === 0
    ) {
      alert("All fields are required, and rating must be between 1 and 5.");
      return;
    }
    try {
      const response = await axios.post(
        `${PORT}/api/student/submitFeedback`,
        feedback
      );
      console.log("Feedback Submitted:", response.data);

      alert("Thank you for your feedback!");

      // Reset form
      setFeedback({ name: "", email: "", message: "", rating: 0 });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>Welcome to Code Learning 🚀</h1>
        <p>
          Learn to code, practice with challenges, and become a pro developer!
        </p>
      </section>
      {props.auth ? (
        <div className={styles.container}>
          <h1>Welcome Back!</h1>
          <p>Continue learning and exploring new courses.</p>
          <div className={styles.buttons}>
            <Link to="/courses" className={styles.joinbutton}>
              Explore Courses
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.container}>
          <h1>Learn without limits</h1>
          <p>
            Start, switch, or advance your career with more courses,
            Professional Certificates.
          </p>
          <div className={styles.buttons}>
            <Link to="/Sign-Up" className={styles.joinbutton}>
              Join For Free
            </Link>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className={styles.features}>
        <h2>Why Choose Us?</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureItem}>
            <h3>📚 Interactive Courses</h3>
            <p>
              Learn programming with step-by-step tutorials and coding
              exercises.
            </p>
          </div>
          <div className={styles.featureItem}>
            <h3>💻 Real-Time Code Editor</h3>
            <p>Practice coding instantly with our built-in editor.</p>
          </div>
          <div className={styles.featureItem}>
            <h3>🏆 Gamification & Rewards</h3>
            <p>Earn points and badges as you progress through courses.</p>
          </div>
          <div className={styles.featureItem}>
            <h3>👨‍👩‍👧‍👦 Community Support</h3>
            <p>
              Join discussions and get help from mentors and fellow learners.
            </p>
          </div>
          <div className={styles.featureItem}>
            <h3>🎯 Coding Challenges</h3>
            <p>
              Test your skills with real-world coding challenges and algorithm
              problems.
            </p>
          </div>
          <div className={styles.featureItem}>
            <h3>❓ Quizzes & Assessments</h3>
            <p>Reinforce your learning with interactive quizzes and tests.</p>
          </div>
          <div className={styles.featureItem}>
            <h3>🤖 AI-Powered Code Assistance</h3>
            <p>
              Get AI-powered hints and solutions when you’re stuck on coding
              problems.
            </p>
          </div>
          <div className={styles.featureItem}>
            <h3>🚀 Project-Based Learning</h3>
            <p>
              Build real-world projects and showcase them in your portfolio.
            </p>
          </div>
        </div>
      </section>
      {/* Feedback Display Section */}
      <section className={styles.feedbackDisplay}>
        <h2>What Our Users Say 🗣️</h2>
        <div className={styles.feedbackList}>
          {feedbackList.length > 0 ? (
            feedbackList.map((fb, index) => (
              <div key={index} className={styles.feedbackItem}>
                <div className={styles.userInfo}>
                  {fb.profilePic ? (
                    <img src={fb.profilePic} alt="User" className={styles.profilePic} />
                  ) : (
                    <span className={styles.defaultProfile}>👤</span>
                  )}
                  <div>
                    <h4>{fb.name}</h4>
                    <div className={styles.starDisplay}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < fb.rating ? styles.filledStar : styles.emptyStar}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className={styles.feedbackMessage}>{fb.message}</p>
              </div>
            ))
          ) : (
            <p>No feedback available yet.</p>
          )}
        </div>
      </section>

      {/* Feedback Form Section */}
      <section className={styles.feedback}>
        <h2>We Value Your Feedback! 📝</h2>
        <form onSubmit={handleSubmit} className={styles.feedbackForm}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={feedback.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={feedback.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Feedback"
            rows="4"
            value={feedback.message}
            onChange={handleChange}
            required
          ></textarea>

          {/* Star Rating Section */}
          <div className={styles.ratingContainer}>
            <p>Rate Us:</p>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`${styles.star} ${
                    feedback.rating >= star ? styles.filled : ""
                  }`}
                  onClick={() => handleRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <button type="submit">Submit Feedback</button>
        </form>
      </section>
    </div>
  );
};

export default Home;
