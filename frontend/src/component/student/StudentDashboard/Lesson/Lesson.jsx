import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Lesson.module.css"; // Updated CSS file
import { API_PORT } from "../../../../../const";
import Practice from "../Practice/Practice"; // Import Practice Component

const Lesson = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [showPractice, setShowPractice] = useState(false); // Toggle state
  const PORT = API_PORT;

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await axios.get(
          `${PORT}/api/student/lesson/${lessonId}`,
          {
            withCredentials: true,
          }
        );
        setLesson(response.data);
      } catch (error) {
        console.error("Error fetching lesson:", error);
      }
    };

    fetchLesson();
  }, [lessonId]);

  if (!lesson) {
    return <p>Loading lesson...</p>;
  }

  // Function to format YouTube URL into embeddable format
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    const videoIdMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:.*v=|embed\/|v\/|.*\/))([a-zA-Z0-9_-]{11})/
    );
    return videoIdMatch
      ? `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&mute=1`
      : null;
  };

  const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);

  return (
    <div className={styles.lessonContainer}>
      <div className={styles.video}>
        <h2>{lesson.title}</h2>
        <p>{lesson.content}</p>

        {/* YouTube Video Section */}
        {embedUrl ? (
          <div className={styles.videoContainer}>
            <iframe
              width="100%"
              height="400"
              src={embedUrl}
              title="Lesson Video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <p>No video available for this lesson.</p>
        )}

        {/* Toggle Button */}
        <button
          className={`${styles.toggleButton} ${
            showPractice ? styles.active : ""
          }`}
          onClick={() => setShowPractice(!showPractice)}
        >
          {showPractice ? "Hide Editor" : "Show Editor"}
        </button>
      </div>
      {showPractice && (
        <>
          <div className={styles.editor}>
            <Practice />
          </div>
        </>
      )}
    </div>
  );
};

export default Lesson;
