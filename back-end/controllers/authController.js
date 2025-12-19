// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (store email in lowercase)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await user.save();

    // ✅ FIXED: Use userId instead of id to match auth middleware
    const token = jwt.sign(
      { 
        userId: user._id,  // ← Changed from 'id' to 'userId'
        email: user.email 
      },
      process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production",
      { expiresIn: "30d" } // ← Changed from 7d to 30d for longer sessions
    );

    console.log('✅ User registered:', user.email);
    console.log('🔑 Token created with userId:', user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,      // ← Keep 'id' for frontend compatibility
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user (case-insensitive email search)
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ FIXED: Use userId instead of id to match auth middleware
    const token = jwt.sign(
      { 
        userId: user._id,  // ← Changed from 'id' to 'userId'
        email: user.email 
      },
      process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production",
      { expiresIn: "30d" } // ← Changed from 7d to 30d for longer sessions
    );

    console.log('✅ Login successful:', user.email);
    console.log('🔑 Token created with userId:', user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,      // ← Keep 'id' for frontend compatibility
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        profilePhoto: user.profilePhoto || null
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId; // ← Changed from req.user.id to req.userId (from auth middleware)

    console.log('🔒 Change password request for userId:', userId);

    // Validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.log('❌ Incorrect old password for:', user.email);
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password changed successfully for:', user.email);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ Change password error:", error);
    res.status(500).json({ message: "Server error during password change" });
  }
};