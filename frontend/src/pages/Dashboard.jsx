import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Silk from '../components/common/Silk';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
              Welcome back, {currentUser?.displayName || 'Student'}! 👋
            </h1>
            <p className="text-xl text-blue-200 drop-shadow-lg">
              Choose how you want to process your lecture
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Record Lecture Card */}
            <Link
              to="/record-lecture"
              className="group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-blue-600 to-blue-700 hover:shadow-2xl hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">🎤</div>
                <h2 className="text-3xl font-bold text-white mb-2">Record Lecture</h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Record a live lecture with real-time transcription and instant AI-powered insights.
                </p>
                <div className="mt-6 text-sm text-blue-200 font-semibold">Click to start →</div>
              </div>
            </Link>

            {/* Upload Audio Card */}
            <Link
              to="/upload-audio"
              className="group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-purple-600 to-purple-700 hover:shadow-2xl hover:shadow-purple-600/50 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">📁</div>
                <h2 className="text-3xl font-bold text-white mb-2">Upload Audio</h2>
                <p className="text-purple-100 text-lg leading-relaxed">
                  Upload existing audio files and get AI-powered summaries, step-by-step explanations, and clarity notes.
                </p>
                <div className="mt-6 text-sm text-purple-200 font-semibold">Click to upload →</div>
              </div>
            </Link>
          </div>

          {/* Features Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">Live Transcription</h3>
              <p className="text-gray-300">Real-time speech-to-text powered by Web Speech API</p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-white mb-2">AI Processing</h3>
              <p className="text-gray-300">Google Gemini AI transforms your content instantly</p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-white mb-2">3 Output Formats</h3>
              <p className="text-gray-300">Simple text, detailed steps, and hearing notes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
