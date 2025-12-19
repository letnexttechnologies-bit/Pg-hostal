// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    console.log('🔍 Auth middleware - Header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('❌ No Authorization header');
      return res.status(401).json({ 
        message: 'No authorization header provided',
        error: 'No token, authorization denied' 
      });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid Authorization header format');
      return res.status(401).json({ 
        message: 'Invalid authorization header format',
        error: 'No token, authorization denied' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token received:', token.substring(0, 20) + '...');
    
    // Verify token
    const secret = process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";
    console.log('🔐 Verifying token with secret...');
    
    const decoded = jwt.verify(token, secret);
    console.log('✅ Token decoded:', { userId: decoded.userId, email: decoded.email });
    
    // Add user data to request
    req.user = decoded;
    req.userId = decoded.userId || decoded.id || decoded._id;
    
    console.log('✅ Auth successful - User ID:', req.userId);
    
    if (!req.userId) {
      console.log('⚠️ Warning: No userId found in token payload');
    }
    
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    console.error('❌ Error name:', error.name);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired',
        error: 'Token has expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        error: 'Token is not valid' 
      });
    }
    
    res.status(401).json({ 
      message: 'Invalid token',
      error: 'Token is not valid' 
    });
  }
};