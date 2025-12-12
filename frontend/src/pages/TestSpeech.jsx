// Quick test page for Web Speech API
import React from 'react';
import LiveTranscription from '../components/lecture/LiveTranscription';

export default function TestSpeech() {
  // For testing, use a mock lecture ID
  const testLectureId = 'test_lecture_123';
  
  return (
    <div className="min-h-screen bg-secondary p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary font-dyslexic">
        Test Live Transcription
      </h1>
      <LiveTranscription lectureId={testLectureId} />
    </div>
  );
}