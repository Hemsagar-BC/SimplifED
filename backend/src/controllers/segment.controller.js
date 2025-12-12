/**
 * Segment Controller - Main API Handler
 * 
 * Complete flow for dyslexia learning:
 * 1. Receive transcribed text from frontend (Web Speech API)
 * 2. Process with Gemini AI (summary, mind map, simplification)
 * 3. Convert simplified text to speech with ElevenLabs
 * 4. Return all results to frontend for display
 */

const GeminiService = require('../services/gemini.service');
const ElevenLabsService = require('../services/elevenlabs.service');
const { db } = require('../services/firebase.service');

// Initialize AI services
let geminiService = null;
let elevenLabsService = null;

try {
  geminiService = new GeminiService(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini Service initialized in segment controller');
} catch (error) {
  console.error('⚠️ Gemini Service initialization failed:', error.message);
}

try {
  elevenLabsService = new ElevenLabsService(process.env.ELEVENLABS_API_KEY);
  console.log('✅ ElevenLabs Service initialized in segment controller');
} catch (error) {
  console.error('⚠️ ElevenLabs Service initialization failed:', error.message);
}

/**
 * Main endpoint: Process live lecture transcript
 * POST /api/segments/process
 * 
 * Flow:
 * 1. Receive transcribed text from Web Speech API
 * 2. Generate summary (Gemini)
 * 3. Generate mind map (Gemini)
 * 4. Simplify text (Gemini)
 * 5. Convert simplified to speech (ElevenLabs)
 * 6. Return everything to frontend
 */
async function processTextSegmentLive(req, res) {
  try {
    const { text, userId, type } = req.body;

    console.log('\n📍 /api/segments/process called');
    console.log('📝 Text length:', text?.length || 0, 'characters');
    console.log('👤 User ID:', userId);
    console.log('🎯 Type:', type, '\n');

    // Validate input
    if (!text || text.trim().length < 20) {
      console.warn('⚠️ Text too short (minimum 20 characters)');
      return res.status(400).json({ 
        error: 'Text too short for processing (minimum 20 characters)' 
      });
    }

    if (!geminiService) {
      return res.status(503).json({ 
        error: 'Gemini Service not available' 
      });
    }

    // Step 1: Process text with Gemini AI (summary, mind map, simplification)
    console.log('🤖 Processing with Gemini AI...');
    const aiResults = await geminiService.processAllTransformations(text);

    // Step 2: Convert simplified text to speech (optional - if ElevenLabs is configured)
    let audioUrl = null;
    let audioBuffer = null;

    if (elevenLabsService && aiResults.simplifiedText) {
      try {
        console.log('🎤 Converting simplified text to speech with ElevenLabs...');
        const ttsResult = await elevenLabsService.textToSpeech(aiResults.simplifiedText);
        audioBuffer = ttsResult.audio;
        console.log('✅ Audio generated:', audioBuffer.length, 'bytes');
      } catch (ttsError) {
        console.error('⚠️ TTS conversion failed:', ttsError.message);
        // Continue without audio - it's optional
      }
    }

    // Step 3: Build response
    const response = {
      success: true,
      transcription: text,
      summary: aiResults.summary,
      mindMap: aiResults.mindMap,
      simplifiedExplanation: aiResults.simplifiedText,
      audio: audioBuffer ? audioBuffer.toString('base64') : null,
      audioFormat: audioBuffer ? 'audio/mpeg' : null,
      processingTime: aiResults.duration
    };

    console.log('\n✅ Processing complete');
    console.log('📊 Response fields:', Object.keys(response).join(', '));
    console.log('🎤 Audio included:', audioBuffer ? `Yes (${audioBuffer.length} bytes)` : 'No\n');

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error in processTextSegmentLive:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process lecture transcript',
      message: error.message
    });
  }
}

/**
 * Save completed lecture to Firestore
 * POST /api/lectures/save
 */
async function saveLecture(req, res) {
  try {
    const { userId, title, transcript, summary, mindMap, simplifiedText, audioUrl } = req.body;

    if (!userId || !title || !transcript) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, title, transcript' 
      });
    }

    if (!db) {
      console.log('⚠️ Firestore not configured, skipping save');
      return res.status(200).json({ 
        message: 'Processing complete but Firestore not configured',
        offline: true
      });
    }

    console.log('\n💾 Saving lecture to Firestore...');
    console.log('📚 Lecture:', title);
    console.log('👤 User:', userId);

    const lectureData = {
      userId,
      title,
      transcript,
      summary,
      mindMap,
      simplifiedText,
      audioUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const lectureRef = await db.collection('lectures').add(lectureData);

    console.log('✅ Lecture saved with ID:', lectureRef.id);

    res.status(201).json({
      success: true,
      lectureId: lectureRef.id,
      message: 'Lecture saved successfully'
    });

  } catch (error) {
    console.error('❌ Error saving lecture:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to save lecture',
      message: error.message
    });
  }
}

/**
 * Get saved lecture
 * GET /api/lectures/:lectureId
 */
async function getLecture(req, res) {
  try {
    const { lectureId } = req.params;

    if (!db) {
      return res.status(503).json({ 
        error: 'Firestore not configured' 
      });
    }

    const lectureDoc = await db.collection('lectures').doc(lectureId).get();

    if (!lectureDoc.exists) {
      return res.status(404).json({ 
        error: 'Lecture not found' 
      });
    }

    res.status(200).json({
      success: true,
      id: lectureDoc.id,
      ...lectureDoc.data()
    });

  } catch (error) {
    console.error('❌ Error getting lecture:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get lecture',
      message: error.message
    });
  }
}

/**
 * Get all lectures for a user
 * GET /api/lectures?userId=:userId
 */
async function getUserLectures(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        error: 'userId query parameter is required' 
      });
    }

    if (!db) {
      return res.status(503).json({ 
        error: 'Firestore not configured' 
      });
    }

    const snapshot = await db
      .collection('lectures')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const lectures = [];
    snapshot.forEach(doc => {
      lectures.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      count: lectures.length,
      lectures
    });

  } catch (error) {
    console.error('❌ Error getting user lectures:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get lectures',
      message: error.message
    });
  }
}

/**
 * Process audio file upload
 * POST /api/segments/process (multipart/form-data)
 * 
 * TODO: Implement speech-to-text conversion for uploaded audio
 * For now, requires transcript in FormData
 */
async function processAudioFile(req, res) {
  try {
    const { transcript, userId, type } = req.body;
    const audioFile = req.file;

    console.log('🎵 Processing audio file upload');
    console.log('File:', audioFile?.filename, 'Size:', audioFile?.size, 'bytes');
    console.log('Transcript length:', transcript?.length || 0, 'characters');

    if (!transcript || transcript.trim().length < 20) {
      return res.status(400).json({ 
        error: 'Transcript must be at least 20 characters',
        received: transcript?.length || 0
      });
    }

    // Process transcript (same as text segment)
    const result = await processTranscript(transcript, userId);
    
    return res.status(200).json({
      success: true,
      ...result,
      audioFile: audioFile?.filename
    });
  } catch (error) {
    console.error('❌ Error processing audio file:', error.message);
    return res.status(500).json({ 
      error: 'Failed to process audio file',
      message: error.message 
    });
  }
}

/**
 * Get all segments for a lecture
 * GET /api/segments/:lectureId
 */
async function getLectureSegments(req, res) {
  try {
    const { lectureId } = req.params;

    if (!lectureId) {
      return res.status(400).json({ error: 'lectureId required' });
    }

    console.log('📖 Getting all segments for lecture:', lectureId);
    
    const lectureDoc = await db.collection('lectures').doc(lectureId).get();
    
    if (!lectureDoc.exists) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    const lectureData = lectureDoc.data();
    const segments = lectureData.segments || [];

    return res.status(200).json({
      success: true,
      lectureId,
      segmentCount: segments.length,
      segments
    });
  } catch (error) {
    console.error('❌ Error getting lecture segments:', error.message);
    return res.status(500).json({ 
      error: 'Failed to get segments',
      message: error.message 
    });
  }
}

/**
 * Get specific segment by index
 * GET /api/segments/:lectureId/:segmentIndex
 */
async function getSegmentByIndex(req, res) {
  try {
    const { lectureId, segmentIndex } = req.params;

    if (!lectureId || segmentIndex === undefined) {
      return res.status(400).json({ error: 'lectureId and segmentIndex required' });
    }

    console.log('📌 Getting segment', segmentIndex, 'from lecture:', lectureId);
    
    const lectureDoc = await db.collection('lectures').doc(lectureId).get();
    
    if (!lectureDoc.exists) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    const segments = lectureDoc.data().segments || [];
    const index = parseInt(segmentIndex, 10);

    if (index < 0 || index >= segments.length) {
      return res.status(404).json({ 
        error: 'Segment not found',
        index,
        segmentCount: segments.length
      });
    }

    return res.status(200).json({
      success: true,
      segment: segments[index],
      index
    });
  } catch (error) {
    console.error('❌ Error getting segment:', error.message);
    return res.status(500).json({ 
      error: 'Failed to get segment',
      message: error.message 
    });
  }
}

/**
 * Helper function to process transcript
 * Shared by both processTextSegmentLive and processAudioFile
 */
async function processTranscript(transcript, userId) {
  const startTime = Date.now();

  // Validate input
  if (!transcript || transcript.trim().length < 20) {
    throw new Error('Transcript must be at least 20 characters');
  }

  // Run all AI transformations in parallel
  console.log('🤖 Starting AI transformations (parallel)...');
  const [summary, mindMap, simplifiedExplanation] = await Promise.all([
    geminiService ? geminiService.generateSummary(transcript) : { error: 'Gemini not available' },
    geminiService ? geminiService.generateMindMap(transcript) : { error: 'Gemini not available' },
    geminiService ? geminiService.simplifyText(transcript) : { error: 'Gemini not available' }
  ]);

  console.log('✅ AI transformations complete');

  // Generate speech from simplified explanation
  let audio = null;
  let audioDuration = null;
  if (elevenLabsService && simplifiedExplanation && !simplifiedExplanation.error) {
    try {
      console.log('🎙️ Converting to speech...');
      const audioBuffer = await elevenLabsService.textToSpeech(simplifiedExplanation);
      audio = audioBuffer.toString('base64');
      // Estimate duration: ~150 words per minute = 0.4 seconds per word
      const wordCount = simplifiedExplanation.split(/\s+/).length;
      audioDuration = Math.round((wordCount / 150) * 60);
      console.log('✅ Audio generated:', audio.length, 'bytes (base64),', audioDuration, 'seconds');
    } catch (error) {
      console.error('⚠️ Audio generation failed:', error.message);
      // Continue without audio
    }
  }

  const processingTime = Date.now() - startTime;

  return {
    transcription: transcript,
    summary: summary || { error: 'Summary generation failed' },
    mindMap: mindMap || { error: 'Mind map generation failed' },
    simplifiedExplanation: simplifiedExplanation || { error: 'Simplification failed' },
    audio: audio || null,
    audioDuration,
    processingTime: `${processingTime}ms`
  };
}

module.exports = {
  processTextSegmentLive,
  processAudioFile,
  getLectureSegments,
  getSegmentByIndex,
  saveLecture,
  getLecture,
  getUserLectures
};
