// Segment controller - handles incoming transcribed text chunks and audio files
// Processes text with Gemini AI and saves to Firestore
// Handles both live transcription chunks and audio file uploads

const { db, storage } = require('../services/firebase.service');
const { processSegment } = require('../services/gemini.service');
const fs = require('fs');
const path = require('path');

// Optional: Initialize Google Cloud Speech-to-Text client (only if credentials available)
let speechClient = null;
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const speech = require('@google-cloud/speech');
    speechClient = new speech.SpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
  }
} catch (error) {
  console.log('⚠️ Google Cloud Speech-to-Text not available, will use Web Speech API transcription');
}

/**
 * Process live text segment from recording
 * POST /api/segments/process
 * Body: { text: string, userId: string, type: 'live-recording' }
 * Returns: Processed segment with AI insights
 */
async function processTextSegmentLive(req, res) {
  try {
    const { text, userId, type } = req.body;

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Text too short for processing (minimum 20 characters)' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log(`📝 Processing live text segment (${text.length} chars)`);

    // Process text with Gemini AI
    const aiResults = await processSegment(text);

    console.log('✅ Live text processing complete');

    // Return results to frontend for real-time display
    res.status(200).json({
      transcription: text,
      simpleSummary: aiResults.simplified || '',
      stepByStepExplanation: aiResults.stepByStep || '',
      clarityNotes: aiResults.clarityNotes || [],
    });

  } catch (error) {
    console.error('❌ Error processing live text:', error);
    res.status(500).json({
      error: 'Failed to process text segment',
      message: error.message
    });
  }
}

/**
 * POST /api/segments/process
 * FormData: { audio: File, transcript: string, userId: string, type: 'recorded'|'uploaded' }
 * Returns: Transcription, simple summary, step-by-step explanation, clarity notes
 */
async function processAudioFile(req, res) {
  try {
    const { transcript, userId, type } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log(`🎵 Processing audio file: ${audioFile.originalname}`);
    console.log(`📊 File size: ${audioFile.size} bytes`);
    console.log(`🎯 Type: ${type}`);

    let transcription = transcript || '';

    // If no transcript provided from Web Speech API, use Google Cloud Speech-to-Text
    if (!transcription || transcription.trim().length === 0) {
      console.log('📝 Transcribing audio using Google Cloud Speech-to-Text...');
      transcription = await transcribeAudio(audioFile);
    } else {
      console.log('✅ Using transcript from Web Speech API');
    }

    console.log(`📄 Transcription length: ${transcription.length} characters`);

    // Process transcription with Gemini AI
    console.log('🤖 Processing with Gemini AI...');
    const aiResults = await processSegment(transcription);

    // Upload audio file to Firebase Storage
    console.log('💾 Uploading audio to Firebase Storage...');
    const audioUrl = await uploadAudioToStorage(audioFile, userId);

    // Return results
    const result = {
      transcription,
      simpleSummary: aiResults.simplified || '',
      stepByStepExplanation: aiResults.stepByStep || '',
      clarityNotes: aiResults.clarityNotes || [],
      audioUrl,
      type,
    };

    console.log('✅ Audio processing complete');
    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error processing audio:', error);
    res.status(500).json({
      error: 'Failed to process audio',
      message: error.message
    });
  }
}

/**
 * Transcribe audio using Google Cloud Speech-to-Text
 */
async function transcribeAudio(audioFile) {
  try {
    // If Google Cloud Speech-to-Text is not available, return empty
    if (!speechClient) {
      console.log('ℹ️ Google Cloud Speech-to-Text not configured, skipping audio transcription');
      return '';
    }

    // Read audio file
    const audioContent = fs.readFileSync(audioFile.path);
    const audioBase64 = audioContent.toString('base64');

    // Determine audio encoding
    let encoding;
    const mimeType = audioFile.mimetype;
    if (mimeType.includes('webm')) {
      encoding = 'WEBM_OPUS';
    } else if (mimeType.includes('mp3')) {
      encoding = 'MP3';
    } else if (mimeType.includes('wav')) {
      encoding = 'LINEAR16';
    } else if (mimeType.includes('ogg')) {
      encoding = 'OGG_OPUS';
    } else {
      encoding = 'ENCODING_UNSPECIFIED'; // Let Google detect
    }

    console.log(`🔊 Audio encoding: ${encoding}`);

    // Call Google Cloud Speech-to-Text API
    const request = {
      audio: {
        content: audioBase64,
      },
      config: {
        encoding: encoding,
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        model: 'latest_long',
      },
    };

    console.log('📡 Sending to Google Cloud Speech-to-Text API...');
    const [operation] = await speechClient.longRunningRecognize(request);

    // Wait for operation to complete
    const [response] = await operation.promise();

    // Extract transcription from response
    let fullTranscript = '';
    response.results.forEach(result => {
      if (result.alternatives && result.alternatives.length > 0) {
        fullTranscript += result.alternatives[0].transcript + ' ';
      }
    });

    console.log(`✅ Transcription complete: ${fullTranscript.length} characters`);
    return fullTranscript.trim();

  } catch (error) {
    console.error('❌ Error transcribing audio:', error);
    // Fallback: return empty transcription
    console.log('⚠️ Transcription failed, proceeding without transcription');
    return '';
  }
}

/**
 * Upload audio file to Firebase Storage
 */
async function uploadAudioToStorage(audioFile, userId) {
  try {
    const timestamp = Date.now();
    const fileName = `lectures/${userId}/audio-${timestamp}.webm`;
    const bucket = storage.bucket();

    // Upload file
    await bucket.upload(audioFile.path, {
      destination: fileName,
      metadata: {
        contentType: audioFile.mimetype,
        metadata: {
          uploadedAt: new Date().toISOString(),
          originalName: audioFile.originalname,
        }
      }
    });

    // Get download URL
    const file = bucket.file(fileName);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Delete local file
    fs.unlinkSync(audioFile.path);

    console.log(`✅ Audio uploaded to: ${fileName}`);
    return url;

  } catch (error) {
    console.error('❌ Error uploading audio:', error);
    return null;
  }
}

/**
 * Process incoming transcribed text segment (original endpoint)
 * POST /api/segments/process
 * Body: { lectureId, segmentIndex, text, timestamp }
 * Returns: Processed segment data
 */
async function processTextSegment(req, res) {
  try {
    const { lectureId, segmentIndex, text, timestamp } = req.body;
    
    // Validate required fields
    if (!lectureId || segmentIndex === undefined || !text) {
      return res.status(400).json({ 
        error: 'Missing required fields: lectureId, segmentIndex, text' 
      });
    }
    
    console.log(`📝 Processing segment ${segmentIndex} for lecture ${lectureId}`);
    
    // Process text with all Gemini AI features
    // This runs: simplify, clarity notes, key points, summary, step-by-step
    const aiResults = await processSegment(text);
    
    // Create segment document in Firestore
    // Path: lectures/{lectureId}/segments/{segmentIndex}
    const segmentData = {
      segmentIndex: parseInt(segmentIndex),
      timestamp: timestamp || new Date(),
      originalText: text,
      ...aiResults,  // simplified, clarityNotes, keyPoints, summary, stepByStep
      status: 'completed',
      createdAt: new Date()
    };
    
    // Save to Firestore
    await db
      .collection('lectures')
      .doc(lectureId)
      .collection('segments')
      .doc(segmentIndex.toString())
      .set(segmentData);
    
    // Update lecture document with latest segment count
    await db.collection('lectures').doc(lectureId).update({
      lastSegmentIndex: parseInt(segmentIndex),
      updatedAt: new Date()
    });
    
    console.log(`✅ Segment ${segmentIndex} processed and saved`);
    
    // Return processed data to frontend
    res.status(200).json({
      success: true,
      segmentIndex,
      data: segmentData
    });
    
  } catch (error) {
    console.error('❌ Error processing segment:', error);
    res.status(500).json({ 
      error: 'Failed to process text segment',
      message: error.message 
    });
  }
}

/**
 * Get all segments for a lecture
 * GET /api/segments/:lectureId
 * Returns: Array of all segments with AI-processed data
 */
async function getLectureSegments(req, res) {
  try {
    const { lectureId } = req.params;
    
    // Get all segments from Firestore, ordered by index
    const segmentsSnapshot = await db
      .collection('lectures')
      .doc(lectureId)
      .collection('segments')
      .orderBy('segmentIndex', 'asc')
      .get();
    
    if (segmentsSnapshot.empty) {
      return res.status(404).json({ 
        error: 'No segments found for this lecture' 
      });
    }
    
    // Convert to array
    const segments = [];
    segmentsSnapshot.forEach(doc => {
      segments.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json({
      success: true,
      count: segments.length,
      segments
    });
    
  } catch (error) {
    console.error('❌ Error fetching segments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lecture segments' 
    });
  }
}

/**
 * Get single segment by index
 * GET /api/segments/:lectureId/:segmentIndex
 */
async function getSegmentByIndex(req, res) {
  try {
    const { lectureId, segmentIndex } = req.params;
    
    const segmentDoc = await db
      .collection('lectures')
      .doc(lectureId)
      .collection('segments')
      .doc(segmentIndex)
      .get();
    
    if (!segmentDoc.exists) {
      return res.status(404).json({ 
        error: 'Segment not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: { id: segmentDoc.id, ...segmentDoc.data() }
    });
    
  } catch (error) {
    console.error('❌ Error fetching segment:', error);
    res.status(500).json({ 
      error: 'Failed to fetch segment' 
    });
  }
}

module.exports = {
  processAudioFile,
  processTextSegmentLive,
  processTextSegment,
  getLectureSegments,
  getSegmentByIndex
};