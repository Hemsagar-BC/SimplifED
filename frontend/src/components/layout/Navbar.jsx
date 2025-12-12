// Navigation bar component for EchoNotes
// Sticky at top, shows logo and navigation links
// Links: Home, Dashboard, New Lecture, Settings
// Right side: Sign In button (if not logged in) or user menu (if logged in)
// Mobile responsive: hamburger menu on small screens
// Uses dyslexia-friendly font and accessible design
// Background: white with shadow

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import StarBorder from '../common/StarBorder';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  
  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo section */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-white flex items-center gap-2">
              
              <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">SimplifiED</span>
            </span>
          </Link>
          
          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-300 hover:text-white font-semibold transition-colors">
              Home
            </Link>
            <a href="/#features" className="text-gray-300 hover:text-white font-semibold transition-colors">
              Features
            </a>
            <Link to="/dashboard" className="text-gray-300 hover:text-white font-semibold transition-colors">
              Dashboard
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-white font-semibold transition-colors">
              About
            </Link>
          </div>
          
          {/* Sign in button or user menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-300"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-300" />
              )}
            </button>
            
            {!currentUser ? (
              <>
                <Link to="/login">
                  <StarBorder
                    as="div"
                    color="cyan"
                    speed="5s"
                    className="cursor-pointer"
                  >
                    Sign In
                  </StarBorder>
                </Link>
                <Link to="/signup">
                  <button className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all">
                    Get Started
                  </button>
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isDark
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {currentUser.email?.[0].toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                </button>
                
                {userMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currentUser.displayName || currentUser.email}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {currentUser.email}
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      className={`block px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-900 hover:bg-gray-100'}`}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm border-t ${isDark ? 'border-gray-600 text-red-400 hover:bg-gray-600' : 'border-gray-200 text-red-600 hover:bg-gray-100'}`}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          {/* Shows on mobile, hidden on desktop */}
          <button 
            className={`md:hidden ${isDark ? 'text-gray-300' : 'text-textDark'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {/* Shows when mobileMenuOpen is true */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${isDark ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t'}`}>
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className={`block ${isDark ? 'text-gray-300 hover:text-white' : 'text-textDark hover:text-primary'} font-dyslexic text-lg`}>
              Home
            </Link>
            <a href="/#features" className={`block ${isDark ? 'text-gray-300 hover:text-white' : 'text-textDark hover:text-primary'} font-dyslexic text-lg`}>
              Features
            </a>
            <Link to="/dashboard" className={`block ${isDark ? 'text-gray-300 hover:text-white' : 'text-textDark hover:text-primary'} font-dyslexic text-lg`}>
              Dashboard
            </Link>
            <Link to="/about" className={`block ${isDark ? 'text-gray-300 hover:text-white' : 'text-textDark hover:text-primary'} font-dyslexic text-lg`}>
              About
            </Link>
            <Link to="/new-lecture" className={`block ${isDark ? 'text-gray-300 hover:text-white' : 'text-textDark hover:text-primary'} font-dyslexic text-lg`}>
              New Lecture
            </Link>
            <div className="pt-3 border-t" style={{ borderColor: isDark ? '#4B5563' : '#e5e7eb' }}>
              <button
                onClick={toggleTheme}
                className={`w-full p-2 rounded-lg transition-colors duration-300 mb-3 ${
                  isDark 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <Link to="/login" className="block mb-2">
                <button className="w-full px-6 py-2 rounded-lg font-semibold text-white bg-gray-700 hover:bg-gray-600 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link to="/signup" className="block">
                <button className="w-full px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}