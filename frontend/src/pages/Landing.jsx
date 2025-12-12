// Landing page for EchoNotes with animated orb background
// Sections: Hero with Orb, Features, How It Works, CTA
// Hero has animated 3D orb background using WebGL
// Orb reacts to mouse hover for interactive feel
// All text dyslexia-friendly, large and clear

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import AuthModal from '../components/common/AuthModal';
import Silk from '../components/common/Silk';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Silk Background - Covers entire page */}
      {/* Dark base layer */}
      <div className="fixed inset-0 w-full h-full bg-linear-to-br from-black via-blue-950 to-slate-950 pointer-events-none z-0"></div>
      
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

      {/* Content wrapper - positioned above background */}
      <div className={`relative z-10 min-h-screen`}>
        <Navbar />
        
        {/* Hero Section */}
        {/* Full viewport, content centered and on top */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 sm:px-8 md:px-12 py-20 text-center overflow-hidden">
          {/* Content - relative positioned to appear on top of background */}
          <div className="relative z-10 max-w-4xl w-full">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 md:mb-12 leading-tight drop-shadow-2xl text-white" style={{textShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3)'}}>
            Make Every Lecture <span className="text-blue-300">Easy to Understand</span> — Instantly.
          </h1>
          
          {/* Primary Description */}
          <p className="text-lg sm:text-xl md:text-2xl mb-6 leading-relaxed drop-shadow-lg font-medium text-blue-100" style={{textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'}}>
            SimplifiED helps students with dyslexia and reading challenges by turning complex lectures into clear, simple, and accessible notes in real time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 md:gap-4 justify-center items-center flex-wrap">
            {currentUser ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full text-base sm:text-lg md:text-xl px-8 py-3 md:py-4 shadow-lg hover:shadow-xl transition-all">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3 md:py-4 rounded-lg font-semibold text-base sm:text-lg md:text-xl transition-all shadow-lg hover:shadow-xl bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Try SimplifiED Now
              </button>
            )}
            <button className={`w-full sm:w-auto px-8 py-3 md:py-4 rounded-lg font-semibold text-base sm:text-lg md:text-xl transition-all shadow-md hover:shadow-lg ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-200'}`}>
              Learn More
            </button>
            <button className={`w-full sm:w-auto px-8 py-3 md:py-4 rounded-lg font-semibold text-base sm:text-lg md:text-xl transition-all shadow-md hover:shadow-lg ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-200'}`}>
              Download for Desktop
            </button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 md:py-32 px-6 sm:px-8 md:px-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight text-white drop-shadow-lg">
              Designed for Everyone
            </h2>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-md">
              With features built specifically for students with dyslexia and reading challenges
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Feature Card 1 */}
            <div className="group p-8 md:p-10 rounded-2xl transition-all duration-300 bg-white/10 backdrop-blur-sm hover:bg-white/20 shadow-lg hover:shadow-xl border-2 border-white/20 hover:border-white/30">
              <div className="text-6xl mb-5">🎤</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                Real-time Recording
              </h3>
              <p className="text-base md:text-lg leading-relaxed text-gray-100">
                Record lectures directly in your browser with crystal-clear audio capture and automatic transcription as you listen.
              </p>
            </div>
            
            {/* Feature Card 2 */}
            <div className="group p-8 md:p-10 rounded-2xl transition-all duration-300 bg-white/10 backdrop-blur-sm hover:bg-white/20 shadow-lg hover:shadow-xl border-2 border-white/20 hover:border-white/30">
              <div className="text-6xl mb-5">🤖</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                AI Simplification
              </h3>
              <p className="text-base md:text-lg leading-relaxed text-gray-100">
                Complex academic language is automatically simplified into clear, easy-to-read text that everyone can understand.
              </p>
            </div>
            
            {/* Feature Card 3 */}
            <div className="group p-8 md:p-10 rounded-2xl transition-all duration-300 bg-white/10 backdrop-blur-sm hover:bg-white/20 shadow-lg hover:shadow-xl border-2 border-white/20 hover:border-white/30">
              <div className="text-6xl mb-5">♿</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                Fully Accessible
              </h3>
              <p className="text-base md:text-lg leading-relaxed text-gray-100">
                OpenDyslexic font, adjustable spacing, color themes, and WCAG compliance—built for accessibility from the ground up.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-24 md:py-32 px-6 sm:px-8 md:px-12 transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight text-white drop-shadow-lg">
              How SimplifiED Works
            </h2>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-md">
              A simple, intuitive process designed to save time and improve comprehension
            </p>
          </div>
          
          <div className="space-y-6 md:space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6 md:gap-8 p-8 rounded-xl transition-all duration-300 bg-white/10 backdrop-blur-sm hover:bg-white/20 shadow-md hover:shadow-lg border-l-4 border-blue-500">
              <div className="shrink-0">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl md:text-3xl font-black">
                  1
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                  Start Recording
                </h3>
                <p className="text-base md:text-lg leading-relaxed text-gray-100">
                  Click the record button and grant microphone access. SimplifiED captures every word of your lecture with high fidelity.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex gap-6 md:gap-8 p-8 rounded-xl transition-all duration-300 bg-white/10 backdrop-blur-sm hover:bg-white/20 shadow-md hover:shadow-lg border-l-4 border-purple-500">
              <div className="shrink-0">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl md:text-3xl font-black">
                  2
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                  Live Transcription
                </h3>
                <p className="text-base md:text-lg leading-relaxed text-gray-100">
                  Watch your lecture get transcribed in real-time. Our AI transcription engine works instantly with high accuracy.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex gap-6 md:gap-8 p-8 rounded-xl transition-all duration-300 bg-white/10 backdrop-blur-sm hover:bg-white/20 shadow-md hover:shadow-lg border-l-4 border-emerald-500">
              <div className="shrink-0">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl md:text-3xl font-black">
                  3
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                  AI Simplification
                </h3>
                <p className="text-base md:text-lg leading-relaxed text-gray-100">
                  Get simplified text that's easier to understand. Complex academic language is broken down into clear, accessible notes.
                </p>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="flex gap-6 md:gap-8 p-8 rounded-xl transition-all duration-300 bg-white/10 backdrop-blur-sm hover:bg-white/20 shadow-md hover:shadow-lg border-l-4 border-orange-500">
              <div className="shrink-0">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl md:text-3xl font-black">
                  4
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                  Save & Review
                </h3>
                <p className="text-base md:text-lg leading-relaxed text-gray-100">
                  Access your lectures anytime, anywhere. Export as PDF, text, or use our interactive study tools to review effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section with Silk Background */}
      <section className="relative py-24 md:py-32 px-6 sm:px-8 md:px-12 bg-linear-to-r from-blue-600 to-blue-700 text-white text-center overflow-hidden">
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full text-base sm:text-lg md:text-xl px-8 py-3 md:py-4 shadow-lg hover:shadow-xl transition-all">
                Start Your First Lecture
              </Button>
            </Link>
            <button className="w-full sm:w-auto px-8 py-3 md:py-4 rounded-lg font-semibold text-base sm:text-lg md:text-xl bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg">
              Schedule a Demo
            </button>
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

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
}