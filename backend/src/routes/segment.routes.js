// Segment routes - handles text chunk processing and audio file upload
// All routes: /api/segments/*

const express = require('express');
const router = express.Router();
const multer = require('multer');
const segmentController = require('../controllers/segment.controller');

// Configure multer for audio file uploads
const upload = multer({
  dest: '/tmp/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Process audio file from frontend (with file upload)
// POST /api/segments/process
// FormData: { audio: File, transcript: string, userId: string, type: 'recorded'|'uploaded' }
// OR JSON: { text: string, userId: string, type: 'live-recording' }
router.post('/process', (req, res, next) => {
  // Check if it's a file upload or JSON text
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    // Handle file upload
    upload.single('audio')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      segmentController.processAudioFile(req, res);
    });
  } else {
    // Handle JSON text
    segmentController.processTextSegmentLive(req, res);
  }
});

// Get all segments for a lecture
// GET /api/segments/:lectureId
router.get('/:lectureId', segmentController.getLectureSegments);

// Get specific segment
// GET /api/segments/:lectureId/:segmentIndex
router.get('/:lectureId/:segmentIndex', segmentController.getSegmentByIndex);

module.exports = router;