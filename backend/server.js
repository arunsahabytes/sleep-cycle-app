const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { securityHeaders, apiLimiter } = require('./middleware/security');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(securityHeaders);

// CORS and body parsing middleware
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting for API routes
app.use('/api', apiLimiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sleep', require('./routes/sleep'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Sleep Cycle API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
