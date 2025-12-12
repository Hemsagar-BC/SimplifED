// Landing page for EchoNotes with animated orb background
// Sections: Hero with Orb, Features, How It Works, CTA
// Hero has animated 3D orb background using WebGL
// Orb reacts to mouse hover for interactive feel
// All text dyslexia-friendly, large and clear

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import Silk from '../components/common/Silk';
import { Mic, Bot, BookOpen, Accessibility, Sparkles, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Silk Background - Covers entire page */}
      {isDark ? (
        <>
          {/* Dark Theme - Multiple Silk Layers */}
          <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-black via-blue-950 to-slate-950 pointer-events-none z-0"></div>
          
          {/* Primary Silk layer - Bright Blue */}
          <div className="fixed inset-0 w-full h-full pointer-events-none opacity-60 z-0">
            <Silk
              speed={8}
              scale={1.5}
              color="#3B82F6"
              noiseIntensity={0.7}
              rotation={0.3}
            />
          </div>
          
          {/* Secondary Silk layer - Deep Blue for depth */}
          <div className="fixed inset-0 w-full h-full pointer-events-none opacity-50 z-0">
            <Silk
              speed={10}
              scale={1.2}
              color="#1E40AF"
              noiseIntensity={0.6}
              rotation={-0.2}
            />
          </div>
          
          {/* Tertiary Silk layer - Black accent for contrast */}
          <div className="fixed inset-0 w-full h-full pointer-events-none opacity-35 z-0">
            <Silk
              speed={7}
              scale={0.9}
              color="#0F172A"
              noiseIntensity={0.5}
              rotation={0.15}
            />
          </div>
        </>
      ) : (
        <>
          {/* Light Theme - Soft Silk Layers */}
          <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 pointer-events-none z-0"></div>
          
          {/* Primary Silk layer - Soft Blue */}
          <div className="fixed inset-0 w-full h-full pointer-events-none opacity-30 z-0">
            <Silk
              speed={8}
              scale={1.5}
              color="#93C5FD"
              noiseIntensity={0.5}
              rotation={0.3}
            />
          </div>
          
          {/* Secondary Silk layer - Soft Purple */}
          <div className="fixed inset-0 w-full h-full pointer-events-none opacity-25 z-0">
            <Silk
              speed={10}
              scale={1.2}
              color="#C4B5FD"
              noiseIntensity={0.4}
              rotation={-0.2}
            />
          </div>
          
          {/* Tertiary Silk layer - Light accent */}
          <div className="fixed inset-0 w-full h-full pointer-events-none opacity-20 z-0">
            <Silk
              speed={7}
              scale={0.9}
              color="#A5F3FC"
              noiseIntensity={0.3}
              rotation={0.15}
            />
          </div>
        </>
      )}

      {/* Content wrapper - positioned above background */}
      <div className={`relative z-10 min-h-screen`}>
        <Navbar />
        
        {/* Hero Section */}
        {/* Full viewport, content centered and on top */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 sm:px-8 md:px-12 py-20 text-center overflow-hidden">
          {/* Content - relative positioned to appear on top of background */}
          <div className="relative z-10 max-w-4xl w-full">
          {/* Main Heading */}
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 md:mb-12 leading-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Make Every Lecture <span className={isDark ? 'text-blue-300' : 'text-blue-600'}>Easy to Understand</span> — Instantly.
          </h1>
          
          {/* Primary Description */}
          <p className={`text-lg sm:text-xl md:text-2xl mb-6 leading-relaxed drop-shadow-lg font-medium ${
            isDark ? 'text-blue-100' : 'text-gray-700'
          }`} style={isDark ? {textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'} : {}}>
            SimplifiED helps students with dyslexia and reading challenges by turning complex lectures into clear, simple, and accessible notes in real time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 md:gap-4 justify-center items-center flex-wrap">
            {currentUser ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <button className={`w-full px-10 py-4 rounded-full font-semibold text-base sm:text-lg md:text-xl transition-all shadow-lg hover:shadow-2xl ${
                  isDark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}>
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <Link to="/signup" className="w-full sm:w-auto">
                <button className={`w-full px-10 py-4 rounded-full font-semibold text-base sm:text-lg md:text-xl transition-all shadow-lg hover:shadow-2xl ${
                  isDark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}>
                  Try SimplifiED Now
                </button>
              </Link>
            )}
            <a href="#features" className="w-full sm:w-auto">
              <button className={`w-full px-10 py-4 rounded-full font-semibold text-base sm:text-lg md:text-xl transition-all shadow-md hover:shadow-lg border-2 backdrop-blur-sm ${
                isDark 
                  ? 'bg-transparent text-white hover:bg-white/10 border-white/30' 
                  : 'bg-white/50 text-gray-900 hover:bg-white/70 border-gray-300'
              }`}>
                Learn More
              </button>
            </a>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 px-6 sm:px-8 md:px-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className={`text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight drop-shadow-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Designed for Everyone
            </h2>
            <p className={`text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md ${
              isDark ? 'text-gray-100' : 'text-gray-700'
            }`}>
              With features built specifically for students with dyslexia and reading challenges
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {/* Feature Card 1 */}
            <div className={`group p-8 md:p-10 rounded-2xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl border-2 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30' 
                : 'bg-white/70 hover:bg-white/90 border-gray-200 hover:border-gray-300'
            }`}>
              <div className="mb-5 flex justify-center">
                <Mic className="w-14 h-14 text-blue-400" />
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Real-time Recording
              </h3>
              <p className={`text-base md:text-lg leading-relaxed ${
                isDark ? 'text-gray-100' : 'text-gray-700'
              }`}>
                Record lectures directly in your browser with crystal-clear audio capture and automatic transcription as you listen.
              </p>
            </div>
            
            {/* Feature Card 2 */}
            <div className={`group p-8 md:p-10 rounded-2xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl border-2 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30' 
                : 'bg-white/70 hover:bg-white/90 border-gray-200 hover:border-gray-300'
            }`}>
              <div className="mb-5 flex justify-center">
                <Bot className="w-14 h-14 text-purple-400" />
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                AI Simplification
              </h3>
              <p className={`text-base md:text-lg leading-relaxed ${
                isDark ? 'text-gray-100' : 'text-gray-700'
              }`}>
                Complex academic language is automatically simplified into clear, easy-to-read text that everyone can understand.
              </p>
            </div>
            
            {/* Feature Card 3 */}
            <div className={`group p-8 md:p-10 rounded-2xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl border-2 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30' 
                : 'bg-white/70 hover:bg-white/90 border-gray-200 hover:border-gray-300'
            }`}>
              <div className="mb-5 flex justify-center">
                <Accessibility className="w-14 h-14 text-green-400" />
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Fully Accessible
              </h3>
              <p className={`text-base md:text-lg leading-relaxed ${
                isDark ? 'text-gray-100' : 'text-gray-700'
              }`}>
                OpenDyslexic font, adjustable spacing, color themes, and WCAG compliance—built for accessibility from the ground up.
              </p>
            </div>
            
            {/* Feature Card 4 - Dyslexia Friendly */}
            <div className={`group p-8 md:p-10 rounded-2xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl border-2 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30' 
                : 'bg-white/70 hover:bg-white/90 border-gray-200 hover:border-gray-300'
            }`}>
              <div className="mb-5 flex justify-center">
                <BookOpen className="w-14 h-14 text-yellow-400" />
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Dyslexia Friendly
              </h3>
              <p className={`text-base md:text-lg leading-relaxed ${
                isDark ? 'text-gray-100' : 'text-gray-700'
              }`}>
                Specially designed with OpenDyslexic font, adjustable line spacing, high contrast modes, and customizable text size for optimal reading comfort.
              </p>
            </div>
            
            {/* Feature Card 5 - Smart Summaries */}
            <div className={`group p-8 md:p-10 rounded-2xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl border-2 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30' 
                : 'bg-white/70 hover:bg-white/90 border-gray-200 hover:border-gray-300'
            }`}>
              <div className="mb-5 flex justify-center">
                <Sparkles className="w-14 h-14 text-pink-400" />
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Smart Summaries
              </h3>
              <p className={`text-base md:text-lg leading-relaxed ${
                isDark ? 'text-gray-100' : 'text-gray-700'
              }`}>
                AI extracts key points and creates chapter breakdowns automatically. Get instant review notes with the most important concepts highlighted.
              </p>
            </div>
            
            {/* Feature Card 6 - Export & Save */}
            <div className={`group p-8 md:p-10 rounded-2xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl border-2 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30' 
                : 'bg-white/70 hover:bg-white/90 border-gray-200 hover:border-gray-300'
            }`}>
              <div className="mb-5 flex justify-center">
                <Download className="w-14 h-14 text-orange-400" />
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Export & Save
              </h3>
              <p className={`text-base md:text-lg leading-relaxed ${
                isDark ? 'text-gray-100' : 'text-gray-700'
              }`}>
                Save notes in multiple formats—PDF, Word, or plain text. Cloud sync keeps everything accessible offline and easy to share with classmates.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section with Silk Background */}
      <section className={`relative py-24 md:py-32 px-6 sm:px-8 md:px-12 text-white text-center overflow-hidden transition-colors duration-500 ${
        isDark 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
          : 'bg-gradient-to-r from-blue-500 to-purple-600'
      }`}>
        {/* Silk background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <Silk
            speed={3}
            scale={1}
            color="#FFFFFF"
            noiseIntensity={1}
            rotation={0.5}
          />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 leading-tight">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg md:text-xl mb-10 md:mb-14 leading-relaxed opacity-95">
            Join thousands of students who are already experiencing better understanding and retention with SimplifiED. Start your journey today.
          </p>
          <div className="flex justify-center items-center">
            <Link to="/signup" className="w-full sm:w-auto">
              <button className="w-full px-10 py-4 rounded-full font-semibold text-base sm:text-lg md:text-xl transition-all shadow-lg hover:shadow-2xl bg-white text-gray-900 hover:bg-gray-100">
                Start Your First Lecture
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className={`${isDark ? 'bg-gray-950' : 'bg-gray-900'} text-white py-12 md:py-16 px-6 sm:px-8 md:px-12 transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-black mb-4">SimplifiED</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Making education accessible for everyone, one lecture at a time.
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Accessibility</a></li>
              </ul>
            </div>
          </div>
          
          <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-800'} pt-8 text-center text-gray-400 text-sm`}>
            <p>Made with ❤️ by Code Lunatics • SimplifiED © 2024. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}