// Live transcription component with Web Speech API
// Shows real-time transcription and AI-processed results
// Automatically sends chunks to backend for simplification

import React, { useState } from 'react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

export default function LiveTranscription({ lectureId }) {
  const [segments, setSegments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Callback when 5-second segment is ready
  const handleSegmentComplete = async (segmentData) => {
    try {
      setIsProcessing(true);
      
      // Send to backend for AI processing
      const response = await fetch('http://localhost:3001/api/segments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(segmentData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Segment processed:', result.data);
        // Add to local state (or use Firestore real-time listener)
        setSegments(prev => [...prev, result.data]);
      }
      
    } catch (error) {
      console.error('❌ Failed to process segment:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Use the speech recognition hook
  const {
    transcript,
    interimTranscript,
    isListening,
    error,
    startListening,
    stopListening,
    segmentIndex
  } = useSpeechRecognition({
    onSegmentComplete: handleSegmentComplete,
    lectureId
  });
  
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-textDark font-dyslexic">
          {isListening ? '🎙️ Recording Live...' : '🎤 Ready to Record'}
        </h2>
        
        {/* Record/Stop Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`
            px-8 py-4 rounded-xl text-xl font-bold font-dyslexic
            transition-all duration-300 transform hover:scale-105
            ${isListening 
              ? 'bg-error text-white animate-pulse' 
              : 'bg-primary text-white hover:bg-[#3A7BC8]'}
          `}
        >
          {isListening ? '⏹️ Stop Recording' : '⏺️ Start Recording'}
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error text-error p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {/* Status Info */}
      {isListening && (
        <div className="flex items-center gap-4 mb-4 p-4 bg-primary/10 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-error rounded-full animate-pulse"></div>
            <span className="font-dyslexic text-lg">Recording</span>
          </div>
          <div className="text-textDark/70">
            Segment: {segmentIndex}
          </div>
          {isProcessing && (
            <div className="flex items-center gap-2 text-primary">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Processing...</span>
            </div>
          )}
        </div>
      )}
      
      {/* Live Transcript */}
      <div className="bg-secondary p-6 rounded-xl mb-6 min-h-[200px]">
        <h3 className="text-xl font-bold text-primary mb-3 font-dyslexic">
          Live Transcript
        </h3>
        <div className="text-lg text-textDark font-dyslexic leading-relaxed">
          {transcript}
          {interimTranscript && (
            <span className="text-primary/70 italic">
              {interimTranscript}
            </span>
          )}
          {!transcript && !interimTranscript && (
            <span className="text-textDark/50">
              Start speaking to see transcription...
            </span>
          )}
        </div>
      </div>
      
      {/* Processed Segments */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-primary font-dyslexic">
          AI-Processed Segments ({segments.length})
        </h3>
        
        {segments.map((segment, index) => (
          <div key={index} className="bg-white border-2 border-primary/20 rounded-xl p-6">
            {/* Original Text */}
            <div className="mb-4">
              <span className="text-sm font-semibold text-textDark/70 uppercase">Original:</span>
              <p className="text-base text-textDark/80 mt-1">{segment.originalText}</p>
            </div>
            
            {/* Simplified Text */}
            <div className="mb-4 bg-primary/5 p-4 rounded-lg">
              <span className="text-sm font-semibold text-primary uppercase">✨ Simplified:</span>
              <p className="text-lg text-textDark font-dyslexic mt-2 leading-relaxed">
                {segment.simplified}
              </p>
            </div>
            
            {/* Key Points */}
            {segment.keyPoints && segment.keyPoints.length > 0 && (
              <div className="mb-4">
                <span className="text-sm font-semibold text-accent uppercase">🔑 Key Points:</span>
                <ul className="mt-2 space-y-1">
                  {segment.keyPoints.map((point, idx) => (
                    <li key={idx} className="text-base text-textDark font-dyslexic flex items-start gap-2">
                      <span className="text-accent">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Clarity Notes */}
            {segment.clarityNotes && segment.clarityNotes.length > 0 && (
              <div>
                <span className="text-sm font-semibold text-success uppercase">💡 Clarity Notes:</span>
                <div className="mt-2 space-y-2">
                  {segment.clarityNotes.map((note, idx) => (
                    <div key={idx} className="bg-success/5 p-3 rounded-lg">
                      <strong className="text-success">{note.term}:</strong>
                      <p className="text-textDark">{note.definition}</p>
                      {note.example && (
                        <p className="text-textDark/70 text-sm italic mt-1">
                          Example: {note.example}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {segments.length === 0 && isListening && (
          <div className="text-center py-8 text-textDark/50 font-dyslexic">
            Processing will start after 5 seconds of speech...
          </div>
        )}
      </div>
    </div>
  );
}