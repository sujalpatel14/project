import axios from "axios";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const JUDGE0_API_KEY = "dffd3c9d16mshd02f7b0e637a52ap11b5a8jsn556fcf93fe77"; // Replace with your actual API key

const languageMapping = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  cpp: 54, // C++
  java: 62, // Java
  c: 50, // C
  go: 60, // Go
  php: 68, // PHP
  ruby: 72, // Ruby
};

export const run = async (req, res) => {
  const { language, code, input } = req.body;

  if (!languageMapping[language]) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  try {
    // Submit code to Judge0
    const response = await axios.post(
      `${JUDGE0_API_URL}?base64_encoded=false&wait=true`,
      {
        language_id: languageMapping[language],
        source_code: code,
        stdin: input || "",
      },
      {
        headers: {
          "X-RapidAPI-Key": JUDGE0_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      }
    );

    const { stdout, stderr, status } = response.data;

    if (status.id === 3) {
      return res.json({ output: stdout });
    } else {
      return res.json({ output: stderr || "Execution failed" });
    }
  } catch (error) {
    res.status(500).json({ error: "Execution error", details: error.message });
  }
};
