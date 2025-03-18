import { useState, useRef, useEffect } from "react";
import styles from "./AIChatBox.module.css";
import axios from "axios";
import { API_PORT } from "../../../../../const";

const AIChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // New loading state
  const chatEndRef = useRef(null);
  const PORT = API_PORT;

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "student", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setLoading(true); // Disable button while waiting for response

    try {
      const response = await axios.post(`${PORT}/api/student/aiAsist`, {
        query: input,
      });
      const aiMessage = { sender: "ai", text: response.data.solution };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.log(error);
      const errorMessage = {
        sender: "ai",
        text: "Sorry, I couldn't process that.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setInput("");
    setLoading(false); // Re-enable button after response
  };

  const formatMessage = (text) => {
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/i;
    const match = text.match(codeBlockRegex);

    if (match) {
      return (
        <pre>
          <code>{match[2]}</code>
        </pre>
      );
    } else {
      return <p>{text}</p>;
    }
  };

  return (
    <div className={styles.chatContainer}>
      <h2 className={styles.chatTitle}>AI Code Helper</h2>

      <div className={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.sender === "student" ? styles.userMessage : styles.aiMessage
            }
          >
            {formatMessage(msg.text)}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <textarea
          className={styles.chatInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your problem..."
          disabled={loading} // Disable input while API is processing
        />
        <button
          className={styles.sendButton}
          onClick={handleSendMessage}
          disabled={loading} // Disable button while API is processing
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default AIChatBox;
