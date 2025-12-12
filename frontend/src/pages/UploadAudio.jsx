import React, { useState, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import Silk from '../components/common/Silk';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const UploadAudio = () => {
  const { currentUser } = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [activeTab, setActiveTab] = useState('simple');
  const [aiResults, setAiResults] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Handle File Selection
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file (MP3, WAV, M4A, etc.)');
      return;
    }

    setUploadedFile(file);
    setTranscript('');
    setAiResults(null);
    setUploadProgress(0);
  };

  // Handle Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadedFile(file);
      setTranscript('');
      setAiResults(null);
      setUploadProgress(0);
    } else {
      alert('Please drop an audio file');
    }
  };

  // Process and Upload Audio
  const handleProcessAudio = async () => {
    if (!uploadedFile) {
      alert('Please select an audio file');
      return;
    }

    setIsUploading(true);
    setTranscript('');
    setAiResults(null);
    setUploadProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('audio', uploadedFile);
      formData.append('userId', currentUser.uid);
      formData.append('type', 'uploaded');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 500);

      // Upload to backend
      const response = await fetch('http://localhost:3001/api/segments/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data = await response.json();
      console.log('Processing result:', data);

      // Set transcript from response or file name
      setTranscript(data.transcription || `[Transcription from ${uploadedFile.name}]`);

      // Set AI Results
      setAiResults({
        simpleSummary: data.simpleSummary || '',
        stepByStepExplanation: data.stepByStepExplanation || '',
        clarityNotes: data.clarityNotes || [],
      });

      // Save lecture to Firestore
      const lectureRef = await addDoc(collection(db, 'lectures'), {
        userId: currentUser.uid,
        title: uploadedFile.name.replace(/\.[^/.]+$/, ''),
        type: 'uploaded',
        transcript: data.transcription || '',
        simpleText: data.simpleSummary || '',
        detailedSteps: data.stepByStepExplanation || '',
        hearingNotes: data.clarityNotes || [],
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        createdAt: serverTimestamp(),
        status: 'processed',
      });

      console.log('✅ Lecture saved:', lectureRef.id);

      // Reset file selection
      setTimeout(() => {
        setUploadedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

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
              📁 Upload Lecture Audio
            </h1>
            <p className="text-lg text-blue-200">Upload any audio file and get instant AI-powered insights</p>
          </div>

          {/* Main Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-fit lg:h-[600px]">
            {/* Left Side - File Upload & Transcript */}
            <div className="bg-linear-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                📂 Upload & Process
              </h2>

              {!uploadedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="flex-1 border-2 border-dashed border-blue-500/50 rounded-lg p-8 flex items-center justify-center cursor-pointer hover:border-blue-400/80 hover:bg-blue-900/10 transition-all duration-300"
                >
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="hidden"
                    id="audio-input"
                  />
                  <label htmlFor="audio-input" className="cursor-pointer text-center w-full">
                    <div className="text-6xl mb-4">🎵</div>
                    <p className="text-xl font-bold text-white mb-2">Drag & drop your audio file</p>
                    <p className="text-gray-300">or click to select (MP3, WAV, M4A, WebM)</p>
                    <p className="text-sm text-gray-500 mt-4">Max file size: 100MB</p>
                  </label>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="mb-6">
                    <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4 mb-4">
                      <p className="text-gray-300 text-sm mb-2">Selected File:</p>
                      <p className="text-white font-semibold text-lg">{uploadedFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    {!isUploading && !aiResults && (
                      <button
                        onClick={handleProcessAudio}
                        className="w-full px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105"
                      >
                        ⚡ Process Audio
                      </button>
                    )}
                  </div>

                  {isUploading && (
                    <div>
                      <p className="text-gray-300 mb-3 text-sm">Processing your audio...</p>
                      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-linear-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-gray-400 text-xs mt-2">{uploadProgress}% Complete</p>
                    </div>
                  )}
                </div>
              )}

              {/* Transcript Display */}
              {transcript && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">📝 Transcription:</p>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <p className="text-gray-200 text-sm leading-relaxed">{transcript}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - AI Results with Tabs */}
            <div className="bg-linear-to-br from-purple-900/80 to-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 flex flex-col">
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
                        ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 overflow-y-auto">
                {isUploading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-purple-300 font-semibold">Processing your audio...</p>
                      <p className="text-purple-200 text-sm mt-2">This may take a moment</p>
                    </div>
                  </div>
                )}

                {!isUploading && aiResults ? (
                  <div>
                    {activeTab === 'simple' && (
                      <div>
                        <h3 className="text-lg font-bold text-green-400 mb-3">📄 Simple Text</h3>
                        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {aiResults.simpleSummary || 'No content available.'}
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
                                <span className="text-blue-400 font-bold shrink-0">{idx + 1}.</span>
                                <span>{step}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'hearing' && (
                      <div>
                        <h3 className="text-lg font-bold text-yellow-400 mb-3">👂 Hearing Notes</h3>
                        <ul className="space-y-2">
                          {aiResults.clarityNotes?.map((note, idx) => (
                            <li key={idx} className="flex gap-3">
                              <span className="text-yellow-400 font-bold shrink-0">→</span>
                              <span className="text-gray-200">{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : !isUploading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-center">
                      Upload and process an audio file to see AI-powered insights here ✨
                    </p>
                  </div>
                ) : null}
              </div>

              {aiResults && !isUploading && (
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setAiResults(null);
                    setTranscript('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="mt-4 w-full px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-semibold rounded-lg transition-all duration-300"
                >
                  + Upload Another Audio
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadAudio;
