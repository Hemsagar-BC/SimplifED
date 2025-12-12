import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import Silk from '../components/common/Silk';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const RecordLecture = () => {
  const { currentUser } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState('simple'); // 'simple', 'detailed', 'hearing'
  const [aiResults, setAiResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSegments, setProcessingSegments] = useState([]);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const lastProcessTimeRef = useRef(0);
  const currentTranscriptRef = useRef('');

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
    recognition.lang = 'en-US';

    let interimTranscript = '';
    let finalTranscript = '';

    recognition.onstart = () => {
      console.log('Listening started');
    };

    recognition.onresult = (event) => {
      interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment + ' ';
        } else {
          interimTranscript += transcriptSegment;
        }
      }
      const fullTranscript = finalTranscript + interimTranscript;
      setTranscript(fullTranscript);
      currentTranscriptRef.current = fullTranscript;

      // Process every 5 seconds if recording
      const now = Date.now();
      if (isRecording && now - lastProcessTimeRef.current > 5000 && fullTranscript.trim().length > 20) {
        processTranscriptSegment(fullTranscript);
        lastProcessTimeRef.current = now;
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isRecording]);

  // Process transcript with Gemini
  const processTranscriptSegment = async (text) => {
    if (!text || text.trim().length < 20) return;

    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/api/segments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
        body: JSON.stringify({
          text,
          userId: currentUser.uid,
          type: 'live-recording',
        }),
      });

      if (!response.ok) throw new Error('Failed to process');

      const data = await response.json();
      setAiResults(data);
      setProcessingSegments([...processingSegments, data]);
    } catch (error) {
      console.error('Error processing segment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start Recording
  const handleStartRecording = async () => {
    try {
      setTranscript('');
      setAiResults(null);
      setProcessingSegments([]);
      setRecordingTime(0);
      audioChunksRef.current = [];
      lastProcessTimeRef.current = 0;

      // Start Web Speech API
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Start audio capture
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  // Stop Recording
  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      clearInterval(timerRef.current);

      // Stop Web Speech API
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Stop audio capture
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();

        mediaRecorderRef.current.onstop = async () => {
          // Final processing
          if (currentTranscriptRef.current.trim().length > 20) {
            await processTranscriptSegment(currentTranscriptRef.current);
          }

          // Save lecture to Firestore
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await saveLecture(audioBlob);
        };
      }

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  // Save lecture to Firestore
  const saveLecture = async (audioBlob) => {
    try {
      const lectureRef = await addDoc(collection(db, 'lectures'), {
        userId: currentUser.uid,
        title: `Lecture - ${new Date().toLocaleDateString()}`,
        type: 'recorded',
        transcript: currentTranscriptRef.current,
        simpleText: aiResults?.simpleSummary || '',
        detailedSteps: aiResults?.stepByStepExplanation || '',
        hearingNotes: aiResults?.clarityNotes || [],
        duration: recordingTime,
        createdAt: serverTimestamp(),
        status: 'processed',
      });

      console.log('✅ Lecture saved:', lectureRef.id);
    } catch (error) {
      console.error('Error saving lecture:', error);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Silk Background */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-black via-blue-950 to-slate-950 pointer-events-none z-0"></div>

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
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                🎤 Live Transcript
              </h2>

              {/* Recording Controls */}
              <div className="flex gap-4 mb-6">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105"
                  >
                    🎙️ Start Recording
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleStopRecording}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition-all duration-300"
                    >
                      ⏹️ Stop Recording
                    </button>
                    <div className="px-6 py-3 bg-gray-700/50 rounded-lg flex items-center justify-center text-white font-bold">
                      {formatTime(recordingTime)}
                    </div>
                  </>
                )}
              </div>

              {/* Transcript Box */}
              <div className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 overflow-y-auto">
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {transcript || (isRecording ? '🎤 Listening... speak now' : '👆 Click "Start Recording" to begin')}
                </p>
              </div>

              {/* Recording Indicator */}
              {isRecording && (
                <div className="mt-4 flex items-center gap-2 justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-300 font-semibold">Recording in progress...</span>
                </div>
              )}
            </div>

            {/* Right Side - AI Results with Tabs */}
            <div className="bg-gradient-to-br from-purple-900/80 to-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-4">✨ AI-Powered Insights</h2>

              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  { id: 'simple', label: 'Simple Text', icon: '📄' },
                  { id: 'detailed', label: 'Detailed Steps', icon: '🔍' },
                  { id: 'hearing', label: 'Hearing Notes', icon: '👂' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 overflow-y-auto">
                {isProcessing ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-purple-300 font-semibold">Processing your lecture...</p>
                    </div>
                  </div>
                ) : aiResults ? (
                  <div>
                    {activeTab === 'simple' && (
                      <div>
                        <h3 className="text-lg font-bold text-green-400 mb-3">📄 Simple Text</h3>
                        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {aiResults.simpleSummary || 'No content yet. Keep recording...'}
                        </p>
                      </div>
                    )}

                    {activeTab === 'detailed' && (
                      <div>
                        <h3 className="text-lg font-bold text-blue-400 mb-3">🔍 Detailed Steps</h3>
                        <div className="text-gray-200 leading-relaxed space-y-2">
                          {aiResults.stepByStepExplanation?.split('\n').map((step, idx) => (
                            step.trim() && (
                              <div key={idx} className="flex gap-3">
                                <span className="text-blue-400 font-bold flex-shrink-0">{idx + 1}.</span>
                                <span>{step}</span>
                              </div>
                            )
                          ))}
                          {!aiResults.stepByStepExplanation && <p>No content yet. Keep recording...</p>}
                        </div>
                      </div>
                    )}

                    {activeTab === 'hearing' && (
                      <div>
                        <h3 className="text-lg font-bold text-yellow-400 mb-3">👂 Hearing Notes</h3>
                        <ul className="space-y-2">
                          {aiResults.clarityNotes?.map((note, idx) => (
                            <li key={idx} className="flex gap-3">
                              <span className="text-yellow-400 font-bold flex-shrink-0">→</span>
                              <span className="text-gray-200">{note}</span>
                            </li>
                          ))}
                          {(!aiResults.clarityNotes || aiResults.clarityNotes.length === 0) && (
                            <p className="text-gray-400">No notes yet. Keep recording...</p>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-center">
                      Start recording to see AI-powered insights here ✨
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordLecture;
