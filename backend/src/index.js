// Express server for EchoNotes backend
// Handles real-time lecture transcription processing with AI
// Features: Text simplification, step-by-step explanations, clarity notes
// Uses Google Gemini for AI processing, Firebase for storage

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
};
app.use(cors(corsOptions));

// Body parser middleware - handle JSON up to 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'EchoNotes backend is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
const lectureRoutes = require('./routes/lecture.routes');
const segmentRoutes = require('./routes/segment.routes');

app.use('/api/lectures', lectureRoutes);
app.use('/api/segments', segmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ═══════════════════════════════════════════════════');
  console.log(`🎙️  EchoNotes Backend Server`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 Lectures API: http://localhost:${PORT}/api/lectures`);
  console.log(`🔗 Segments API: http://localhost:${PORT}/api/segments`);
  console.log('🚀 ═══════════════════════════════════════════════════');
});

module.exports = app;