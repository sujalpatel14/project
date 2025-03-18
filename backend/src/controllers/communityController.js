import jwt from "jsonwebtoken";
import CommunityPost from "../models/CommunityPost.models.js";

/**
 * @description Create a new post
 */
export const createPost = async (req, res) => {
  try {
    // Extract token from cookies
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized - No token" });

    // Verify and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { title, content } = req.body;
    const newPost = new CommunityPost({ userId, title, content });
    await newPost.save();

    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @description Get all posts with comments
 */
export const getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate("userId", "name profilePic")
      .populate("comments.userId", "name profilePic")
      .sort({ dateCreated: -1 }).limit(15);

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @description Add a comment
 */
export const addComment = async (req, res) => {
  try {
    // Extract token and user ID
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized - No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { text } = req.body;
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({ userId, text });
    await post.save();

    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @description Like a post
 */
export const likePost = async (req, res) => {
  try {
    // Extract token and user ID
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized - No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { postId } = req.params;

    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Toggle like
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ message: "Like updated", likes: post.likes.length });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Server error" });
  }
};
