// Main App component for EchoNotes
// Sets up React Router with routes
// Routes: / (Landing), /dashboard (Dashboard), /new-lecture (AudioRecorder page)
// Will add AuthProvider and ProtectedRoute later
// Uses BrowserRouter for routing

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Temporary page for new lecture (will create proper page later)
import AudioRecorder from './components/lecture/AudioRecorder';
import Navbar from './components/layout/Navbar';
import Silk from './components/common/Silk';

// Temporary New Lecture Page
function NewLecturePage() {
  const handleRecordingComplete = (audioBlob) => {
    console.log('Recording completed!', audioBlob);
    alert('Recording saved! Will upload to Firebase soon.');
  };
  
  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Silk Background - Covers entire page */}
      {/* Dark base layer */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-black via-blue-950 to-slate-950 pointer-events-none z-0"></div>
      
      {/* Primary Silk layer - Bright Blue */}
      <div className="fixed inset-0 w-full h-full pointer-events-none opacity-60 z-0">
        <Silk
          speed={2}
          scale={1.2}
          color="#3B82F6"
          noiseIntensity={0.8}
          rotation={0.3}
        />
      </div>
      
      {/* Secondary Silk layer - Purple */}
      <div className="fixed inset-0 w-full h-full pointer-events-none opacity-40 z-0">
        <Silk
          speed={1.5}
          scale={1}
          color="#8B5CF6"
          noiseIntensity={1.2}
          rotation={-0.2}
        />
      </div>
      
      {/* Tertiary Silk layer - Cyan */}
      <div className="fixed inset-0 w-full h-full pointer-events-none opacity-30 z-0">
        <Silk
          speed={2.5}
          scale={0.8}
          color="#06B6D4"
          noiseIntensity={1}
          rotation={0.5}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center text-white mb-8 drop-shadow-lg">
            Record New Lecture
          </h1>
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/new-lecture" 
              element={
                <ProtectedRoute>
                  <NewLecturePage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}