// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { register, login } = require("../controllers/authController");
const auth = require("../middleware/auth");
const User = require("../models/User");

router.post("/register", register);
router.post("/login", login);

// Change Password Route
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: "Current password and new password are required" 
      });
    }

    // Get user from database - CHANGED: Use req.userId instead of req.user.id
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        error: "Current password is incorrect" 
      });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        error: "New password must be different from current password" 
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: "New password must be at least 6 characters long" 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      success: true,
      message: "Password changed successfully" 
    });

  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;