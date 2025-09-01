const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Handle both "Bearer token" and plain "token" formats
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.user.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError);
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

module.exports = auth; 