// Lecture routes for handling lecture operations
// Routes: POST /api/lectures (create), GET /api/lectures (list), GET /api/lectures/:id, PATCH, DELETE
// All routes require authentication via Firebase ID token

const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lecture.controller');
const { verifyIdToken } = require('../services/firebase.service');

/**
 * Middleware to verify Firebase ID token
 * Extracts userId from token and attaches to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const decodedToken = await verifyIdToken(token);
    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token', message: error.message });
  }
};

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/lectures
 * Create a new lecture
 */
router.post('/', lectureController.createLecture);

/**
 * GET /api/lectures
 * Get all lectures for the authenticated user
 */
router.get('/', lectureController.getUserLectures);

/**
 * GET /api/lectures/:lectureId
 * Get a specific lecture by ID
 */
router.get('/:lectureId', lectureController.getLectureById);

/**
 * PATCH /api/lectures/:lectureId
 * Update lecture (status, duration, title)
 */
router.patch('/:lectureId', lectureController.updateLecture);

/**
 * DELETE /api/lectures/:lectureId
 * Delete a lecture and all its segments
 */
router.delete('/:lectureId', lectureController.deleteLecture);

module.exports = router;
