// Lecture controller for handling lecture-related operations
// Manages creation, retrieval, and listing of lectures
// Lectures store metadata: user ID, title, timestamp, language
// Individual text chunks are stored as segments with AI-processed content

const { db, auth } = require('../services/firebase.service');

/**
 * Create a new lecture
 * POST /api/lectures
 * Body: { title: string, userId?: string }
 */
async function createLecture(req, res) {
  try {
    const { title, userId } = req.body;
    const authUserId = req.userId; // From auth middleware

    const finalUserId = userId || authUserId;
    if (!finalUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Lecture title is required' });
    }

    // Create lecture document
    const lectureRef = db.collection('lectures').doc();
    const lectureData = {
      id: lectureRef.id,
      userId: finalUserId,
      title: title.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'recording', // recording, processing, completed
      segmentCount: 0,
      duration: 0,
    };

    await lectureRef.set(lectureData);

    res.status(201).json({
      success: true,
      message: 'Lecture created successfully',
      lecture: lectureData,
    });
  } catch (error) {
    console.error('❌ Error creating lecture:', error);
    res.status(500).json({
      error: 'Failed to create lecture',
      message: error.message,
    });
  }
}

/**
 * Get lecture by ID
 * GET /api/lectures/:lectureId
 */
async function getLectureById(req, res) {
  try {
    const { lectureId } = req.params;

    const lectureDoc = await db.collection('lectures').doc(lectureId).get();

    if (!lectureDoc.exists) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    const lecture = lectureDoc.data();

    // Verify user has access to this lecture
    if (lecture.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized access to this lecture' });
    }

    res.status(200).json({
      success: true,
      lecture: lecture,
    });
  } catch (error) {
    console.error('❌ Error fetching lecture:', error);
    res.status(500).json({
      error: 'Failed to fetch lecture',
      message: error.message,
    });
  }
}

/**
 * Get all lectures for a user
 * GET /api/lectures
 */
async function getUserLectures(req, res) {
  try {
    const userId = req.userId;

    const lecturesSnapshot = await db
      .collection('lectures')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const lectures = [];
    lecturesSnapshot.forEach((doc) => {
      lectures.push(doc.data());
    });

    res.status(200).json({
      success: true,
      count: lectures.length,
      lectures: lectures,
    });
  } catch (error) {
    console.error('❌ Error fetching user lectures:', error);
    res.status(500).json({
      error: 'Failed to fetch lectures',
      message: error.message,
    });
  }
}

/**
 * Update lecture status
 * PATCH /api/lectures/:lectureId
 * Body: { status?: string, duration?: number, title?: string }
 */
async function updateLecture(req, res) {
  try {
    const { lectureId } = req.params;
    const { status, duration, title } = req.body;

    const lectureRef = db.collection('lectures').doc(lectureId);
    const lectureDoc = await lectureRef.get();

    if (!lectureDoc.exists) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    const lecture = lectureDoc.data();

    // Verify user has access
    if (lecture.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (duration !== undefined) updateData.duration = duration;
    if (title) updateData.title = title.trim();

    await lectureRef.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Lecture updated successfully',
      lecture: { ...lecture, ...updateData },
    });
  } catch (error) {
    console.error('❌ Error updating lecture:', error);
    res.status(500).json({
      error: 'Failed to update lecture',
      message: error.message,
    });
  }
}

/**
 * Delete a lecture
 * DELETE /api/lectures/:lectureId
 */
async function deleteLecture(req, res) {
  try {
    const { lectureId } = req.params;

    const lectureRef = db.collection('lectures').doc(lectureId);
    const lectureDoc = await lectureRef.get();

    if (!lectureDoc.exists) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    const lecture = lectureDoc.data();

    // Verify user has access
    if (lecture.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete all segments associated with this lecture
    const segmentsSnapshot = await db
      .collection('lectures')
      .doc(lectureId)
      .collection('segments')
      .get();

    segmentsSnapshot.forEach(async (doc) => {
      await doc.ref.delete();
    });

    // Delete the lecture
    await lectureRef.delete();

    res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting lecture:', error);
    res.status(500).json({
      error: 'Failed to delete lecture',
      message: error.message,
    });
  }
}

module.exports = {
  createLecture,
  getLectureById,
  getUserLectures,
  updateLecture,
  deleteLecture,
};
