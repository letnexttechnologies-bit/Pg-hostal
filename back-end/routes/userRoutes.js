const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers
} = require("../controllers/userController");
const auth = require("../middleware/auth"); // Import auth middleware
const User = require("../models/User"); // Import User model

// Existing routes
router.post("/", createUser);
router.get("/", getUsers);

// NEW ROUTES FOR SETTINGS PAGE

// Get user by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user settings and profile
router.put("/:id", auth, async (req, res) => {
  try {
    const { settings, ...otherUpdates } = req.body;
    
    // Only allow user to update their own data
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const updateData = {};
    if (settings) updateData.settings = settings;
    Object.assign(updateData, otherUpdates);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user account
router.delete("/:id", auth, async (req, res) => {
  try {
    // Only allow user to delete their own account
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Optional: Delete user's wishlist entries
    // You can add cleanup code here if needed
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user profile (alternative endpoint)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;