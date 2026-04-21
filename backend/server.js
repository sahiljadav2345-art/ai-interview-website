const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder
app.use('/uploads', express.static('uploads'));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interview-website');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Routes
const authRoutes = require('./src/routes/authRoutes');
const resumeRoutes = require('./src/routes/resumeRoutes');
const interviewRoutes = require('./src/routes/interviewRoutes');
const evaluationRoutes = require('./src/routes/evaluationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/evaluations', evaluationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Backend is running 🚀',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI || 'localhost'}`);
});