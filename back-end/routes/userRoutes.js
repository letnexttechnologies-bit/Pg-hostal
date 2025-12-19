// ===================================
// routes/userRoutes.js
// ===================================
const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers
} = require("../controllers/userController");
const auth = require("../middleware/auth");
const User = require("../models/User");

// Existing routes
router.post("/", createUser);
router.get("/", getUsers);

// Get current user profile - Use /me endpoint (comes before /:id to avoid conflicts)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

// Get user by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

// Update user settings and profile
router.put("/:id", auth, async (req, res) => {
  try {
    const { settings, ...otherUpdates } = req.body;
    
    // Only allow user to update their own data - FIXED: Use req.userId
    if (req.userId !== req.params.id) {
      return res.status(403).json({ 
        success: false,
        error: 'Not authorized to update this user' 
      });
    }
    
    const updateData = {};
    if (settings) updateData.settings = settings;
    Object.assign(updateData, otherUpdates);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

// Delete user account
router.delete("/:id", auth, async (req, res) => {
  try {
    // Only allow user to delete their own account - FIXED: Use req.userId
    if (req.userId !== req.params.id) {
      return res.status(403).json({ 
        success: false,
        error: 'Not authorized to delete this account' 
      });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    // Optional: Delete user's wishlist entries
    // await Wishlist.deleteMany({ user: req.params.id });
    
    res.json({ 
      success: true,
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

module.exports = router;