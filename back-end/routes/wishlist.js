// backend/routes/wishlist.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PG = require('../models/PG');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth header:", authHeader); // Debug log
  
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    console.log("No token provided"); // Debug log
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log("Decoded token:", decoded); // Debug log
    req.userId = decoded.userId || decoded.id || decoded._id;
    console.log("User ID set to:", req.userId); // Debug log
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message); // Debug log
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user's wishlist
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('wishlist');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      success: true,
      wishlist: user.wishlist || [] 
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching wishlist', 
      error: error.message 
    });
  }
});

// Add to wishlist
router.post('/', verifyToken, async (req, res) => {
  try {
    const { pgId } = req.body;
    console.log("=== Add to Wishlist ===");
    console.log("User ID:", req.userId);
    console.log("PG ID from request:", pgId);
    
    if (!pgId) {
      return res.status(400).json({ 
        success: false,
        message: 'PG ID is required' 
      });
    }
    
    const user = await User.findById(req.userId);
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Check if PG exists
    const pg = await PG.findById(pgId);
    console.log("PG found:", pg ? "Yes" : "No");
    
    if (!pg) {
      return res.status(404).json({ 
        success: false,
        message: 'PG not found' 
      });
    }
    
    // Check if already in wishlist
    console.log("Current wishlist:", user.wishlist);
    const alreadyInWishlist = user.wishlist && user.wishlist.some(id => id.toString() === pgId.toString());
    console.log("Already in wishlist:", alreadyInWishlist);
    
    if (alreadyInWishlist) {
      return res.status(400).json({ 
        success: false,
        message: 'PG already in wishlist' 
      });
    }
    
    // Add to wishlist
    if (!user.wishlist) {
      user.wishlist = [];
    }
    user.wishlist.push(pgId);
    await user.save();
    console.log("Wishlist updated, new length:", user.wishlist.length);
    
    // Return updated wishlist with populated data
    const updatedUser = await User.findById(req.userId).populate('wishlist');
    console.log("Returning wishlist with", updatedUser.wishlist.length, "items");
    
    res.json({ 
      success: true,
      message: 'Added to wishlist', 
      wishlist: updatedUser.wishlist 
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding to wishlist', 
      error: error.message 
    });
  }
});

// Remove from wishlist
router.delete('/:pgId', verifyToken, async (req, res) => {
  try {
    const { pgId } = req.params;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Remove from wishlist
    if (user.wishlist) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== pgId.toString());
      await user.save();
    }
    
    // Return updated wishlist with populated data
    const updatedUser = await User.findById(req.userId).populate('wishlist');
    res.json({ 
      success: true,
      message: 'Removed from wishlist', 
      wishlist: updatedUser.wishlist 
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error removing from wishlist', 
      error: error.message 
    });
  }
});

module.exports = router;