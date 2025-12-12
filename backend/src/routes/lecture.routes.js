/**
 * Lecture Routes - Save and retrieve processed lectures
 * 
 * POST /api/lectures - Save new lecture
 * GET /api/lectures - Get all lectures for user
 * GET /api/lectures/:id - Get specific lecture
 * PUT /api/lectures/:id - Update lecture
 * DELETE /api/lectures/:id - Delete lecture
 */

const express = require('express');
const router = express.Router();
const {
  saveLecture,
  getUserLectures,
  getLecture
} = require('../controllers/segment.controller');

// Save new lecture
router.post('/', saveLecture);

// Get all lectures for user
router.get('/', getUserLectures);

// Get specific lecture
router.get('/:lectureId', getLecture);

module.exports = router;
