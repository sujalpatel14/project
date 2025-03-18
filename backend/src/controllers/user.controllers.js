import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Controller to add a new user
export const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists." });
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      password, // Password will be hashed by the pre-save hook
      role, // Default to 'student' if not provided
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Respond with the saved user details (excluding the password)
    res.status(201).json({
      message: "User created successfully.",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        dateCreated: savedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the user." });
  }
};

// Controller to get users
export const getUsers = async (req, res) => {
  try {
    const { search } = req.query;

    // Build a search query if the search parameter exists
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } }, // Case-insensitive name search
            { email: { $regex: search, $options: "i" } }, // Case-insensitive email search
          ],
        }
      : {}; // If no search term, return all users

    const users = await User.find(query);

    res.status(200).json(users); // Return users as a JSON response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users. Please try again." });
  }
};

// Controller to delete a user
export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Find and delete the user by ID
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Controller to edit a user's details
export const editUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, role, password } = req.body;

  try {
    // Check if the user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (name) existingUser.name = name;
    if (email) existingUser.email = email;
    if (role) existingUser.role = role;
    if (password) existingUser.password = password;

    // Save the updated user
    const updatedUser = await existingUser.save();

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const AdminLogin = async(req,res)=>{
  try {
    const { email, password } = req.body;


    //Find admin by email
    const admin = await User.findOne({ email });
    
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    //Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    //Generate JWT token with admin role
    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    //Set secure HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.json({ success: true , message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

//  Update Name
export const updateName = async (req, res) => {
  try {
    // Extract token from cookies & decode user ID
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required." });
    }

    const user = await User.findByIdAndUpdate(userId, { name }, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "Name updated successfully.", name: user.name });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update Password
export const updatePassword = async (req, res) => {
  try {
    //Extract token from cookies & decode user ID
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    //Validate password input
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    //Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    //Set new password (Triggers `pre('save')` Hook for Hashing)
    user.password = password;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error." });
  }
};
