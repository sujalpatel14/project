import { useState, useEffect } from "react";
import axios from "axios";
import MonacoEditor from "@monaco-editor/react";
import styles from "./Practice.module.css";
import { API_PORT } from "../../../../../const";


const Practice = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [theme, setTheme] = useState("vs-light");
  const [fontSize, setFontSize] = useState(14);
  const [editorHeight, setEditorHeight] = useState(300);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [status, setStatus] = useState("");


  const PORT = API_PORT;

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "cpp", label: "C++" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
    { value: "go", label: "Go" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
  ];

  const fileExtensions = {
    javascript: "js",
    python: "py",
    cpp: "cpp",
    java: "java",
    c: "c",
    go: "go",
    php: "php",
    ruby: "rb",
  };

  const exampleCodes = {
    javascript: `console.log("Hello, World!");`,
    python: `print("Hello, World!")`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, World!";\n  return 0;\n}`,
    java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`,
    c: `#include <stdio.h>\nint main() {\n  printf("Hello, World!");\n  return 0;\n}`,
    go: `package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, World!")\n}`,
    php: `<?php\n  echo "Hello, World!";\n?>`,
    ruby: `puts "Hello, World!"`,
  };


  useEffect(() => {
    const savedCode = localStorage.getItem(`savedCode-${language}`) || exampleCodes[language];
    setCode(savedCode);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(`savedCode-${language}`, code);
  }, [code, language]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running...");
    setExecutionTime(null);
    setStatus("");

    const startTime = performance.now();
    try {
      const response = await axios.post(
        `${PORT}/api/student/run`,
        { language, code, input },
        { withCredentials: true }
      );

      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));
      setOutput(response.data.output);
      setStatus("✅ Success");
    } catch (error) {
      setOutput("Error executing code: " + error.message);
      setStatus("❌ Error");
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownloadCode = () => {
    const fileExtension = fileExtensions[language] || "txt";
    const fileName = `code.${fileExtension}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${styles.container} ${theme === "vs-dark" ? styles.dark : styles.light}`}>
      <h1>Code Editor & Runner 🖥️</h1>

      <div className={styles.controls}>
        <label>Language: </label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>

        <label>Font Size:</label>
        <input type="number" min="10" max="20" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />

        <label>Editor Height:</label>
        <input type="number" min="200" max="600" value={editorHeight} onChange={(e) => setEditorHeight(Number(e.target.value))} />

        <button onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}>{theme === "vs-dark" ? "Light Mode ☀️" : "Dark Mode 🌙"}</button>
        <button onClick={() => setLineNumbers(!lineNumbers)}>{lineNumbers ? "Hide Line Numbers" : "Show Line Numbers"}</button>
      </div>

      <MonacoEditor
        height={`${editorHeight}px`}
        theme="vs-dark"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
        className={styles.editor}
        options={{ fontSize, lineNumbers: lineNumbers ? "on" : "off" }}
      />

      <textarea className={styles.inputBox} placeholder="Enter input here..." value={input} onChange={(e) => setInput(e.target.value)} />

      <div className={styles.buttons}>
        <button onClick={handleRunCode} disabled={isRunning}>{isRunning ? "Running..." : "Run Code ▶️"}</button>
        <button onClick={handleDownloadCode}>Download Code ⬇️</button>
      </div>

      <div className={styles.outputBox}>
        <h3>Output:</h3>
        <pre>{output}</pre>
        {executionTime && <p className={styles.executionTime}>Execution Time: {executionTime}ms</p>}
        {status && <p className={styles.status}>{status}</p>}
      </div>
    </div>
  );
};

export default Practice;
