import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Silk from '../components/common/Silk';
import MindMapVisualization from '../components/lecture/MindMapVisualization';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const RecordLecture = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState('simple');
  const [aiResults, setAiResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const currentTranscriptRef = useRef('');
  const recordingStartTimeRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Web Speech API not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language; // Use selected language

    let interimTranscript = '';
    let finalTranscript = '';

    recognition.onstart = () => {
      console.log('🎤 Listening started - start speaking!');
    };

    recognition.onresult = (event) => {
      interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        console.log(`📝 Result ${i}: ${transcriptSegment} (final: ${event.results[i].isFinal})`);
        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment + ' ';
        } else {
          interimTranscript += transcriptSegment;
        }
      }
      const fullTranscript = finalTranscript + interimTranscript;
      setTranscript(fullTranscript);
      currentTranscriptRef.current = fullTranscript;
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      alert(`Microphone error: ${event.error}. Please check your microphone permissions.`);
    };

    recognition.onend = () => {
      console.log('🛑 Listening stopped');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // REMOVED: Process transcript every 5 seconds
  // Now processing happens only when recording stops (in handleStopRecording)

  // Process transcript with Gemini
  const processTranscriptSegment = async (text) => {
    if (!text || text.trim().length < 20) {
      console.log('⏭️ Text too short, skipping processing');
      return;
    }

    console.log(`⚡ Processing text segment (${text.length} chars)...`);
    console.log('📤 Sending request body:', { textLength: text.length, userId: currentUser?.uid || 'dev-user', type: 'live-recording' });
    setIsProcessing(true);
    try {
      const requestBody = {
        text,
        userId: currentUser?.uid || 'dev-user',
        type: 'live-recording',
      };
      
      console.log('🔗 Fetching from: http://localhost:3001/api/segments/process');
      console.log('📦 Request body:', requestBody);
      
      const response = await fetch('http://localhost:3001/api/segments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response received, status:', response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Server returned error:', response.status, error);
        throw new Error(`Server error ${response.status}: ${error}`);
      }

      const data = await response.json();
      console.log('✅ AI Processing result received:', data);
      console.log('📊 Data fields check:', {
        hasSimpleSummary: !!data.simpleSummary,
        hasStepByStep: !!data.stepByStepExplanation,
        hasSummary: !!data.summary,
        hasMindMap: !!data.mindMap,
        hasClarityNotes: !!data.clarityNotes,
      });
      console.log('📄 Simple Summary content:', data.simpleSummary?.substring(0, 100));
      console.log('🔍 Step by Step content:', data.stepByStepExplanation?.substring(0, 100));
      console.log('📝 Summary content:', data.summary?.substring(0, 100));
      console.log('🧠 Mind Map content:', data.mindMap);
      
      setAiResults(data);
      
      // Handle audio from backend (ElevenLabs TTS)
      if (data.audio && data.audioFormat) {
        try {
          const audioBlob = new Blob([Buffer.from(data.audio, 'base64')], { type: data.audioFormat });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          console.log('🔊 Audio TTS ready for playback');
        } catch (audioError) {
          console.error('❌ Error creating audio blob:', audioError);
        }
      }
      
      console.log('✨ AI Results state updated');
    } catch (error) {
      console.error('❌ Error processing segment:', error.message);
      console.error('Error stack:', error.stack);
      alert(`Processing error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start Recording
  const handleStartRecording = async () => {
    try {
      if (!recognitionRef.current) {
        alert('Web Speech API not available. Please use a modern browser (Chrome, Edge, Safari).');
        return;
      }

      setTranscript('');
      setAiResults(null);
      setRecordingTime(0);
      audioChunksRef.current = [];
      currentTranscriptRef.current = '';

      console.log('🚀 Starting recording...');

      // Start Web Speech API
      recognitionRef.current.start();

      // Start audio capture
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('✅ Microphone access granted');
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
      };

      mediaRecorder.start();
      setIsRecording(true);
      recordingStartTimeRef.current = Date.now();
      console.log('📍 Recording started');

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      alert(`Microphone Error: ${error.message}\n\nPlease:\n1. Check microphone permissions\n2. Ensure microphone is not in use\n3. Try a different browser`);
    }
  };

  // Stop Recording
  const handleStopRecording = async () => {
    try {
      console.log('⏹️ Stop Recording clicked');
      setIsRecording(false);
      clearInterval(timerRef.current);

      // Stop Web Speech API
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        console.log('🎤 Web Speech API stopped');
      }

      // Stop audio capture
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        console.log('🎙️ Media Recorder stopped');

        mediaRecorderRef.current.onstop = async () => {
          console.log('📊 MediaRecorder onstop event fired');
          // Final processing
          const finalTranscript = currentTranscriptRef.current.trim();
          console.log('📝 Final transcript length:', finalTranscript.length);
          console.log('📝 Final transcript preview:', finalTranscript.substring(0, 100));
          
          if (finalTranscript.length > 20) {
            console.log('✅ Transcript long enough, starting AI processing...');
            await processTranscriptSegment(finalTranscript);
          } else {
            console.warn('⚠️ Transcript too short for processing');
          }

          // Save lecture to Firestore
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioURL = URL.createObjectURL(audioBlob);
          
          // Calculate duration from recording time
          const recordingDuration = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
          
          const lectureId = await saveLecture(
            finalTranscript,
            audioURL,
            aiResults,
            recordingDuration
          );
          console.log("Lecture saved with ID:", lectureId);
          console.log("AI results that were saved:", aiResults);
          
          if (lectureId) {
            console.log('🚀 Navigating to transcript view...');
            navigate(`/lectures/${lectureId}`);
          } else {
            console.error('❌ Failed to save lecture, not navigating');
          }
        };
      }

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        console.log('🔌 All audio tracks stopped');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };
  // Save lecture to Firestore
  const saveLecture = async (transcript, audioURL, results, duration) => {
    try {
      console.log('💾 Saving lecture with AI results:', results);
      const lectureRef = await addDoc(collection(db, 'lectures'), {
        userId: currentUser.uid,
        title: `Lecture - ${new Date().toLocaleDateString()}`,
        type: 'recorded',
        transcript: transcript,
        simplifiedExplanation: results?.simplifiedExplanation || '',
        summary: results?.summary || '',
        mindMap: results?.mindMap || { mainTopic: 'No content', branches: [] },
        audio: results?.audio || null,
        audioFormat: results?.audioFormat || null,
        duration: duration,
        createdAt: serverTimestamp(),
        status: 'processed',
      });

      console.log('✅ Lecture saved:', lectureRef.id);
      return lectureRef.id;
    } catch (error) {
      console.error('Error saving lecture:', error);
      alert('Error saving lecture: ' + error.message);
      return null;
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/Pause audio
  const handlePlayAudio = async () => {
    try {
      if (!audioPlayerRef.current) return;
      
      if (isPlayingAudio) {
        audioPlayerRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        await audioPlayerRef.current.play();
        setIsPlayingAudio(true);
      }
    } catch (error) {
      console.error('❌ Error playing audio:', error);
    }
  };

  // Handle audio end
  const handleAudioEnd = () => {
    setIsPlayingAudio(false);
  };

  // Debug: Check API availability on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    console.log('🔍 RecordLecture Component Mounted');
    console.log('📱 Web Speech API Available:', !!SpeechRecognition);
    console.log('🎤 MediaRecorder Available:', !!window.MediaRecorder);
    console.log('🔌 getUserMedia Available:', !!navigator.mediaDevices?.getUserMedia);
    console.log('👤 Current User:', currentUser?.email);
  }, [currentUser]);

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Silk Background */}
      <div className="fixed inset-0 w-full h-full bg-linear-to-br from-black via-blue-950 to-slate-950 pointer-events-none z-0"></div>

      <div className="fixed inset-0 w-full h-full pointer-events-none opacity-60 z-0">
        <Silk speed={8} scale={1.5} color="#3B82F6" noiseIntensity={0.7} rotation={0.3} />
      </div>

      <div className="fixed inset-0 w-full h-full pointer-events-none opacity-50 z-0">
        <Silk speed={10} scale={1.2} color="#1E40AF" noiseIntensity={0.6} rotation={-0.2} />
      </div>

      <div className="fixed inset-0 w-full h-full pointer-events-none opacity-35 z-0">
        <Silk speed={7} scale={0.9} color="#0F172A" noiseIntensity={0.5} rotation={0.15} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">
              📚 Record New Lecture
            </h1>
            <p className="text-lg text-blue-200">Real-time transcription with AI-powered insights</p>
          </div>

          {/* Main Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-fit lg:h-[600px]">
            {/* Left Side - Live Transcription */}
            <div className="bg-linear-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                🎤 Live Transcript
              </h2>

              {/* Language Selection */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-blue-200 block mb-2">Select Language:</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isRecording}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white font-medium hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <option value="en-US">🇺🇸 English (US)</option>
                  <option value="en-GB">🇬🇧 English (UK)</option>
                  <option value="es-ES">🇪🇸 Español</option>
                  <option value="fr-FR">🇫🇷 Français</option>
                  <option value="de-DE">🇩🇪 Deutsch</option>
                  <option value="it-IT">🇮🇹 Italiano</option>
                  <option value="pt-BR">🇧🇷 Português</option>
                  <option value="ja-JP">🇯🇵 日本語</option>
                  <option value="ko-KR">🇰🇷 한국어</option>
                  <option value="zh-CN">🇨🇳 中文 (简体)</option>
                  <option value="zh-TW">🇹🇼 中文 (繁體)</option>
                  <option value="ru-RU">🇷🇺 Русский</option>
                  <option value="ar-SA">🇸🇦 العربية</option>
                  <option value="hi-IN">🇮🇳 हिन्दी</option>
                </select>
              </div>

              {/* Recording Controls */}
              <div className="flex gap-4 mb-6">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105"
                  >
                    🎙️ Start Recording
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition-all duration-300"
                  >
                    ⏹️ Stop Recording
                  </button>
                )}
              </div>

              {/* Recording Time */}
              {isRecording && (
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-400">Recording Time: <span className="text-blue-400 font-bold">{formatTime(recordingTime)}</span></p>
                </div>
              )}

              {/* Transcript Box */}
              <div className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 overflow-y-auto">
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {transcript || (isRecording ? '🎤 Listening... speak now' : '👆 Click "Start Recording" to begin')}
                </p>
              </div>
            </div>

            {/* Right Side - AI Results with Tabs */}
            <div className="bg-linear-to-br from-purple-900/80 to-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-4">✨ AI-Powered Insights</h2>

              {/* Audio Player - Show when TTS audio is available */}
              {audioUrl && (
                <div className="mb-4 bg-linear-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePlayAudio}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isPlayingAudio
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isPlayingAudio ? '⏸️ Pause' : '▶️ Play Audio'}
                    </button>
                    <audio
                      ref={audioPlayerRef}
                      src={audioUrl}
                      onEnded={handleAudioEnd}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-300">🔊 AI Voice Explanation</span>
                  </div>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  { id: 'simple', label: 'Simple Text', icon: '📄' },
                  { id: 'detailed', label: 'Detailed Steps', icon: '🔍' },
                  { id: 'mindmap', label: 'Mind Map', icon: '🧠' },
                  { id: 'summary', label: 'Summary', icon: '📝' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {aiResults ? (
                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'simple' && (
                    <div>
                      <h3 className="text-lg font-bold text-green-400 mb-3">📄 Simple Explanation</h3>
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-base">
                        {aiResults.simplifiedExplanation || 'Stop recording to see dyslexia-friendly explanation...'}
                      </p>
                    </div>
                  )}

                  {activeTab === 'detailed' && (
                    <div>
                      <h3 className="text-lg font-bold text-blue-400 mb-3">🔍 Detailed Steps</h3>
                      <div className="text-gray-200 leading-relaxed space-y-2">
                        {aiResults.simplifiedExplanation?.split('\n').map((step, idx) => (
                          step.trim() && (
                            <div key={idx} className="flex gap-3">
                              <span className="text-blue-400 font-bold shrink-0">{idx + 1}.</span>
                              <span>{step}</span>
                            </div>
                          )
                        ))}
                        {!aiResults.simplifiedExplanation && <p>No content yet. Keep recording...</p>}
                      </div>
                    </div>
                  )}

                  {activeTab === 'mindmap' && (
                    <div className="h-full">
                      <MindMapVisualization mindMapData={aiResults.mindMap} />
                    </div>
                  )}

                  {activeTab === 'summary' && (
                    <div>
                      <h3 className="text-lg font-bold text-emerald-400 mb-3">📝 Summary (Bullet Points)</h3>
                      <div className="bg-linear-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 rounded-xl p-5">
                        <div className="text-gray-200 leading-relaxed space-y-2">
                          {aiResults.summary?.split('\n').map((point, idx) => (
                            point.trim() && (
                              <div key={idx} className="flex gap-3">
                                <span className="text-emerald-400 text-xl shrink-0">•</span>
                                <span>{point.trim()}</span>
                              </div>
                            )
                          ))}
                          {!aiResults.summary && <p>No summary yet. Keep recording...</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center flex-1">
                  <p className="text-gray-400 text-center">
                    {isRecording 
                      ? '🎤 Recording... tabs will populate after you stop'
                      : 'Start recording to see AI-powered insights here ✨'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordLecture;
