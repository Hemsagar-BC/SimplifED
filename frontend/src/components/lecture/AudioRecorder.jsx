// Audio recorder component with visual feedback
// Shows large record/stop button with pulse animation when recording
// Displays duration timer in MM:SS format
// Shows waveform animation when recording
// Props: onRecordingComplete - callback with audio blob when done
// Uses useAudioRecorder custom hook for recording logic

import React, { useEffect } from 'react';
import useAudioRecorder from '../../hooks/useAudioRecorder';
import Button from '../common/Button';

export default function AudioRecorder({ onRecordingComplete }) {
  const { isRecording, audioBlob, duration, error, startRecording, stopRecording } = useAudioRecorder();
  
  // When recording stops and audioBlob is ready, pass it to parent
  useEffect(() => {
    if (audioBlob && onRecordingComplete) {
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);
  
  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Title */}
      <h2 className="text-3xl font-bold text-white drop-shadow-lg">
        {isRecording ? '🎙️ Recording...' : '🎤 Ready to Record'}
      </h2>
      
      {/* Record/Stop button */}
      {/* Large circular button, 32x32, red when recording with pulse */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`
          w-32 h-32 rounded-full flex items-center justify-center text-4xl
          transition-all duration-300 transform hover:scale-110 active:scale-95
          focus:outline-none focus:ring-4 focus:ring-blue-500/50
          ${isRecording 
            ? 'bg-red-600 animate-pulse shadow-lg shadow-red-600/50' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg'
          }
        `}
      >
        {isRecording ? '⏹️' : '⏺️'}
      </button>
      
      {/* Duration display */}
      <div className="text-2xl font-mono text-white drop-shadow-md">
        {formatDuration(duration)}
      </div>
      
      {/* Status text */}
      <p className="text-lg text-gray-100 text-center max-w-md drop-shadow-md">
        {isRecording 
          ? 'Recording your lecture. Click the stop button when finished.' 
          : 'Click the record button to start recording your lecture.'}
      </p>
      
      {/* Error message if any */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Waveform animation when recording */}
      {isRecording && (
        <div className="flex items-center gap-1 h-16">
          {/* 5 animated bars with different delays */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 bg-blue-400 rounded-full animate-pulse"
              style={{
                height: '100%',
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}