/**
 * API Routes - Speech-to-Text Processing for Dyslexic Students
 * 
 * Main endpoint: POST /api/segments/process
 * - Input: Transcribed text from Web Speech API
 * - Output: Summary, Mind Map, Simplified Explanation, Audio (TTS)
 */

const express = require('express');
const router = express.Router();
const {
  processTextSegmentLive,
  saveLecture,
  getLecture,
  getUserLectures
} = require('../controllers/segment.controller');

// Process transcribed lecture text
// Input: { text: string, userId: string, type: 'live-recording' }
// Output: { summary, mindMap, simplifiedExplanation, audio (base64) }
router.post('/process', processTextSegmentLive);

// Save processed lecture
// Input: { userId, title, transcript, summary, mindMap, simplifiedText }
router.post('/lectures', saveLecture);

// Get single lecture
router.get('/lectures/:lectureId', getLecture);

// Get all lectures for user
router.get('/lectures', getUserLectures);

module.exports = router;
