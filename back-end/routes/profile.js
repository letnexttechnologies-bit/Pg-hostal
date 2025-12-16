const express = require('express');
const router = express.Router();
const User = require('../models/User');
// Remove this line: const auth = require('../middleware/auth');

// GET user by ID - Remove 'auth' from the route
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE user profile - Remove 'auth' from the route
router.put('/users/:userId', async (req, res) => {
  try {
    const { name, phone, location, dateOfBirth, gender, occupation, bio, profilePhoto } = req.body;
    
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
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;