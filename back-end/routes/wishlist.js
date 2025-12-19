const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PG = require('../models/PG');
const auth = require('../middleware/auth'); // Import the auth middleware

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 Fetching wishlist for user:', req.userId);
    
    const user = await User.findById(req.userId).populate('wishlist');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      wishlist: user.wishlist || [] 
    });
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching wishlist', 
      error: error.message 
    });
  }
});

// Add to wishlist
router.post('/', auth, async (req, res) => {
  try {
    const { pgId } = req.body;
    console.log('➕ Add to wishlist - User:', req.userId, 'PG:', pgId);
    
    if (!pgId) {
      return res.status(400).json({ 
        success: false,
        message: 'PG ID is required' 
      });
    }
    
    // Check if PG exists
    const pg = await PG.findById(pgId);
    if (!pg) {
      return res.status(404).json({ 
        success: false,
        message: 'PG not found' 
      });
    }
    
    // Get user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Initialize wishlist if it doesn't exist
    if (!user.wishlist) {
      user.wishlist = [];
    }
    
    // Check if already in wishlist
    const alreadyInWishlist = user.wishlist.some(
      id => id.toString() === pgId.toString()
    );
    
    if (alreadyInWishlist) {
      return res.status(400).json({ 
        success: false,
        message: 'PG already in wishlist' 
      });
    }
    
    // Add to wishlist
    user.wishlist.push(pgId);
    await user.save();
    
    // Return updated wishlist with populated data
    const updatedUser = await User.findById(req.userId).populate('wishlist');
    
    console.log('✅ Added to wishlist, total items:', updatedUser.wishlist.length);
    
    res.json({ 
      success: true,
      message: 'Added to wishlist', 
      wishlist: updatedUser.wishlist 
    });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding to wishlist', 
      error: error.message 
    });
  }
});

// Remove from wishlist
router.delete('/:pgId', auth, async (req, res) => {
  try {
    const { pgId } = req.params;
    console.log('➖ Remove from wishlist - User:', req.userId, 'PG:', pgId);
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Remove from wishlist
    if (user.wishlist) {
      const initialLength = user.wishlist.length;
      user.wishlist = user.wishlist.filter(
        id => id.toString() !== pgId.toString()
      );
      
      if (user.wishlist.length === initialLength) {
        return res.status(404).json({
          success: false,
          message: 'PG not found in wishlist'
        });
      }
      
      await user.save();
    }
    
    // Return updated wishlist with populated data
    const updatedUser = await User.findById(req.userId).populate('wishlist');
    
    console.log('✅ Removed from wishlist, remaining items:', updatedUser.wishlist.length);
    
    res.json({ 
      success: true,
      message: 'Removed from wishlist', 
      wishlist: updatedUser.wishlist 
    });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error removing from wishlist', 
      error: error.message 
    });
  }
});

module.exports = router;