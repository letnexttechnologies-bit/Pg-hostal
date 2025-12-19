// ===================================
// routes/profile.js
// ===================================
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth'); // Add auth back

// GET user by ID - PROTECTED ROUTE
router.get('/users/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
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

// UPDATE user profile - PROTECTED ROUTE
router.put('/users/:userId', auth, async (req, res) => {
  try {
    const { name, phone, location, dateOfBirth, gender, occupation, bio, profilePhoto } = req.body;
    
    // Check if user is updating their own profile
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Not authorized to update this profile' 
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        name,
        phone,
        location,
        dateOfBirth,
        gender,
        occupation,
        bio,
        profilePhoto
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

module.exports = router;