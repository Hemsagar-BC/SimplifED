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
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  
  return (
    <nav className={`sticky top-0 z-50 ${isDark ? 'bg-gray-800 shadow-lg' : 'bg-white shadow-md'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo section */}
          {/* Link to home with "EchoNotes" text in primary color, large font */}
          <Link to="/" className="flex items-center gap-2">
            <span className={`text-2xl font-bold text-primary font-dyslexic`}>🎙️ EchoNotes</span>
          </Link>
          
          {/* Desktop navigation links */}
          {/* Hidden on mobile (md:flex), flex gap-6 */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-textDark hover:text-primary'} font-dyslexic text-lg transition-colors`}>
              Home
            </Link>
            <Link to="/dashboard" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-textDark hover:text-primary'} font-dyslexic text-lg transition-colors`}>
              Dashboard
            </Link>
            <Link to="/new-lecture" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-textDark hover:text-primary'} font-dyslexic text-lg transition-colors`}>
              New Lecture
            </Link>
          </div>
          
          {/* Sign in button or user menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a1 1 0 011.414-1.414l2.12 2.12a1 1 0 11-1.414 1.414zM2.05 6.464l2.12 2.12a1 1 0 01-1.414 1.414L.636 7.878a1 1 0 011.414-1.414zM17.657 16.97l-2.12-2.12a1 1 0 011.414-1.414l2.12 2.12a1 1 0 11-1.414 1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            {!currentUser ? (
              <Button variant="primary" onClick={() => console.log('Sign in')}>
                Sign In
              </Button>
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
            <Link to="/dashboard" className={`block ${isDark ? 'text-gray-300 hover:text-white' : 'text-textDark hover:text-primary'} font-dyslexic text-lg`}>
              Dashboard
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
              <Button variant="primary" fullWidth onClick={() => console.log('Sign in')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}