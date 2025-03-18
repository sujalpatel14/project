import { Challenge } from "../models/challenges.models.js";
import { Progress } from "../models/progress.models.js";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";
 
export const addChallenge = async (req, res) => {
  try {
    const { courseId, title, description, starterCode, testCases, difficulty } =
      req.body;

    // Validate required fields
    if (
      !courseId ||
      !title ||
      !description ||
      !starterCode ||
      !testCases ||
      !difficulty
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create a new challenge
    const newChallenge = new Challenge({
      courseId,
      title,
      description,
      starterCode,
      testCases, // Expecting array of { input, expectedOutput }
      difficulty,
    });

    // Save to database
    await newChallenge.save();
    res
      .status(201)
      .json({
        message: "Challenge added successfully!",
        challenge: newChallenge,
      });
  } catch (error) {
    console.error("Error adding challenge:", error);
    res.status(500).json({ message: "Server error while adding challenge." });
  }
};

export const getChallengesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find challenges that match the given course ID and populate the course title
    const challenges = await Challenge.find({ courseId }).populate({
      path: "courseId",
      select: "title", // Only fetch the title field from the Course model
    });

    if (!challenges.length) {
      return res
        .status(404)
        .json({ message: "No challenges found for this course" });
    }

    res.status(200).json(challenges);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateChallenge = async (req, res) => {
  const { challengeId } = req.params; // The challengeId from URL params
  const { title, description, starterCode, testCases, difficulty } = req.body; // Data from the request body

  try {
    // Find the challenge by challengeId and update the fields
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      challengeId,
      {
        title,
        description,
        starterCode,
        testCases,
        difficulty,
      },
      { new: true } // Return the updated challenge
    );

    if (!updatedChallenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    // Respond with the updated challenge data
    res.status(200).json({
      message: "Challenge updated successfully",
      updatedChallenge,
    });
  } catch (error) {
    console.error("Error updating challenge: ", error);
    res.status(500).json({ message: "Error updating challenge" });
  }
};

export const deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params; // Get challenge ID from URL params

    const challenge = await Challenge.findByIdAndDelete(id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.status(200).json({ message: "Challenge deleted successfully" });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Fetch all challenges for students
export const getChallenges = async (req, res) => {
  try {
    const { courseId } = req.query;
  
    const challenges = await Challenge.find({courseId:courseId}).sort({ createdAt: -1 });
    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ message: "Error fetching challenges", error });
  }
};


export const submitChallenge = async (req, res) => {
  const { id } = req.params;
  const { code , title , description , language } = req.body;


  try {
    // 📌 Extract user ID from JWT stored in cookies
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized access" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 📌 Find the challenge
    const challenge = await Challenge.findById(id);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    const expectedOutput = challenge.testCases[0].expectedOutput.trim();

    // 📌 AI Execution Logic (Gemini API)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing Gemini API Key" });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    ${title}
    \`\`\`c
    ${code}
    \`\`\`

    Expected Output:
    ${expectedOutput}
    
    If the code runs successfully, return only correct.
    If there is an error, return only the error message.
    `;

    const result = await model.generateContent(prompt);
    const aiOutput = result.response.candidates[0]?.content?.parts[0]?.text?.trim();

    if (!aiOutput) {
      return res.status(500).json({ message: "AI did not return an output." });
    }

    // 📌 Compare AI-generated output with expected output
    let isCorrect = aiOutput === 'correct';

    if (isCorrect) {
      // // 📌 Ensure progress exists
      // let progress = await Progress.findOne({ userId, courseId: challenge.courseId });

      // if (!progress) {
      //   progress = new Progress({
      //     userId,
      //     courseId: challenge.courseId,
      //     completedChallenges: [],
      //   });
      // }

      // // 📌 Ensure completedChallenges is an array before using .includes()
      // if (!Array.isArray(progress.completedChallenges)) {
      //   progress.completedChallenges = [];
      // }

      // // 📌 Add challenge if not already completed
      // if (!progress.completedChallenges.includes(challenge._id.toString())) {
      //   progress.completedChallenges.push(challenge._id);
      // }

      // progress.dateLastAccessed = new Date();
      // await progress.save();

      // // 📌 Fetch the latest progress after update
      // const studentProgress = await Progress.findOne({ userId, courseId: challenge.courseId });

      return res.status(200).json({
        message: "Correct solution! Challenge completed."
      });
    } else {
      return res.json({ message: `Incorrect solution. Try again!${aiOutput}` });
    }
  } catch (error) {
    console.error("Error submitting challenge:", error);
    res.status(500).json({ message: "Error submitting challenge", error });
  }
};
