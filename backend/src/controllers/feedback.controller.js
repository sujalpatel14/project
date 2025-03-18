import Feedback from "../models/feedback.models.js";

// Submit Feedback
export const submitFeedback = async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;

    // Validate required fields
    if (!name || !email || !message || !rating) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Validate rating (1 to 5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    // Create new feedback entry
    const newFeedback = new Feedback({ name, email, message, rating });
    await newFeedback.save();

    res.status(201).json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Feedback submission error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ rating: { $gte: 3, $lte: 5 } }) // Get feedback with rating 3-5
      .sort({ createdAt: -1 }) // Sort by most recent feedback
      .limit(5); // Limit to 5 feedback entries

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};