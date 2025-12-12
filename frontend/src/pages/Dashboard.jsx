// Dashboard page - main hub after login
// Shows welcome message with user name
// Quick action cards: Start New Lecture, Upload Audio, View History
// Recent lectures list (empty state if no lectures)
// Stats cards: Total lectures, Total hours recorded, This week count
// Uses grid layout, responsive design

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Silk from '../components/common/Silk';
import Button from '../components/common/Button';

export default function Dashboard() {
  // Mock data for now (will connect to Firebase later)
  const userName = 'Student';
  const recentLectures = [];
  const stats = {
    totalLectures: 0,
    totalHours: 0,
    thisWeek: 0,
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
      
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-xl text-gray-100 drop-shadow-md">
              Ready to make learning easier today?
            </p>
          </div>
          
          {/* Stats cards */}
          {/* 3 cards in grid: Total Lectures, Total Hours, This Week */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-3xl font-bold text-blue-400">{stats.totalLectures}</div>
              <div className="text-gray-100">Total Lectures</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-3xl font-bold text-purple-400">{stats.totalHours}h</div>
              <div className="text-gray-100">Hours Recorded</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-3xl font-bold text-cyan-400">{stats.thisWeek}</div>
              <div className="text-gray-100">This Week</div>
            </div>
          </div>
        
          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Start New Lecture card */}
            <Link to="/new-lecture" className="group">
              <div className="bg-gradient-to-br from-blue-600/80 to-purple-600/80 backdrop-blur-sm border-2 border-white/20 text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="text-5xl mb-4">🎙️</div>
                <h3 className="text-2xl font-bold mb-2">Start New Lecture</h3>
                <p className="text-white/90">Record a new lecture with real-time transcription</p>
              </div>
            </Link>
            
            {/* Upload Audio card */}
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer">
              <div className="text-5xl mb-4">📤</div>
              <h3 className="text-2xl font-bold text-white mb-2">Upload Audio</h3>
              <p className="text-gray-100">Upload an existing audio file to transcribe</p>
            </div>
          </div>
          
          {/* Recent lectures section */}
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">Recent Lectures</h2>
            
            {/* Empty state if no lectures */}
            {recentLectures.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl text-gray-100 mb-4">No lectures yet</p>
                <Link to="/new-lecture">
                  <button className="px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all shadow-lg hover:shadow-xl">
                    Record Your First Lecture
                  </button>
                </Link>
              </div>
            ) : (
              // Lecture list will go here
              <div className="space-y-4">
                {/* Map through lectures */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}