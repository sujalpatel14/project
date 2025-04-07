import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Community.module.css";
import { API_PORT } from "../../../../../const";

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const PORT = API_PORT;

  useEffect(() => {
    fetchPosts();
    
    // Fetch posts every 1 seconds
    const interval = setInterval(fetchPosts, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(`${PORT}/api/student/posts`,{ withCredentials: true });
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${PORT}/api/student/create`,
        { title, content },
        { withCredentials: true }
      );
      setTitle("");
      setContent("");
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(
        `${PORT}/api/student/like/${postId}`,
        {},
        { withCredentials: true }
      );
      fetchPosts();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <div className={styles.community}>
      <div className={styles.posts}>
        {posts.map((post) => (
          <div key={post._id} className={styles.post}>
            <img src={post.userId.profilePic} alt="" />
            <div className={styles.postContentWrapper}>
              <h3 className={styles.postTitle}>{post.title}</h3>
              <p className={styles.postContent}>{post.content}</p>
            </div>
            <button
              className={styles.likeButton}
              onClick={() => handleLike(post._id)}
            >
              ❤️ {post.likes.length}
            </button>
          </div>
        ))}
      </div>

      <form className={styles.postForm} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={styles.input}
        />
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className={styles.textarea}
        />
        <button type="submit" className={styles.button}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Community;
