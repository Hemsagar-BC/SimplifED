// Main App component for SimplifiED
// Sets up React Router with routes
// Routes: / (Landing), /dashboard (Dashboard), /record-lecture, /upload-audio
// Uses BrowserRouter for routing

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import RecordLecture from './pages/RecordLecture';
import UploadAudio from './pages/UploadAudio';
import TranscriptView from './pages/TranscriptView';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/record-lecture" element={<RecordLecture />} />
            <Route path="/upload-audio" element={<UploadAudio />} />
            <Route path="/lectures/:lectureId" element={<TranscriptView />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}