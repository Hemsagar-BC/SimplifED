// Custom hook for Web Speech API - real-time voice-to-text transcription
// Browser feature - no API key needed, completely FREE
// Works in Chrome, Edge, Safari (not Firefox)
// Returns: transcript text, isListening state, start/stop functions
// Automatically handles interim results and final results
// Sends text chunks to backend every 5 seconds for AI processing

import { useState, useEffect, useRef } from 'react';

export default function useSpeechRecognition({ 
  onSegmentComplete,  // Callback when 5-second segment is ready
  lectureId 
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [segmentIndex, setSegmentIndex] = useState(0);
  
  const recognitionRef = useRef(null);
  const segmentTextRef = useRef('');
  const segmentTimerRef = useRef(null);
  
  // Initialize Speech Recognition
  useEffect(() => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Browser does not support Speech Recognition. Please use Chrome or Edge.');
      return;
    }
    
    // Create recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configuration for real-time transcription
    recognition.continuous = true;  // Keep listening continuously
    recognition.interimResults = true;  // Get partial results as user speaks
    recognition.lang = 'en-US';  // Language (change if needed)
    recognition.maxAlternatives = 1;  // Only get best result
    
    // Handle results event - fires as user speaks
    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      
      // Loop through results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          // Final result - user finished speaking this phrase
          final += transcriptPiece + ' ';
        } else {
          // Interim result - still speaking
          interim += transcriptPiece;
        }
      }
      
      // Update states
      if (final) {
        setTranscript(prev => prev + final);
        segmentTextRef.current += final;
      }
      setInterimTranscript(interim);
    };
    
    // Handle errors
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        console.log('No speech detected. Keep talking...');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
        setIsListening(false);
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };
    
    // Handle end event - recognition stopped
    recognition.onend = () => {
      // Auto-restart if still in listening mode
      if (isListening) {
        try {
          recognition.start();
        } catch (err) {
          console.log('Recognition restart failed:', err);
        }
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening]);
  
  // Send segment to backend every 5 seconds
  useEffect(() => {
    if (isListening) {
      segmentTimerRef.current = setInterval(() => {
        const segmentText = segmentTextRef.current.trim();
        
        // Only send if there's meaningful text (more than 10 characters)
        if (segmentText.length > 10) {
          console.log(`📤 Sending segment ${segmentIndex} to backend:`, segmentText);
          
          // Send to backend for AI processing
          if (onSegmentComplete) {
            onSegmentComplete({
              lectureId,
              segmentIndex,
              text: segmentText,
              timestamp: new Date()
            });
          }
          
          // Reset for next segment
          segmentTextRef.current = '';
          setSegmentIndex(prev => prev + 1);
        }
      }, 5000); // Every 5 seconds
      
      return () => {
        if (segmentTimerRef.current) {
          clearInterval(segmentTimerRef.current);
        }
      };
    }
  }, [isListening, segmentIndex, lectureId, onSegmentComplete]);
  
  // Start listening function
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setError(null);
        setTranscript('');
        setInterimTranscript('');
        setSegmentIndex(0);
        segmentTextRef.current = '';
        
        recognitionRef.current.start();
        setIsListening(true);
        console.log('🎤 Speech recognition started');
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start speech recognition');
      }
    }
  };
  
  // Stop listening function
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Send final segment if any text remaining
      const finalText = segmentTextRef.current.trim();
      if (finalText.length > 10 && onSegmentComplete) {
        onSegmentComplete({
          lectureId,
          segmentIndex,
          text: finalText,
          timestamp: new Date()
        });
      }
      
      console.log('🛑 Speech recognition stopped');
    }
  };
  
  return {
    transcript,           // Final accumulated text
    interimTranscript,    // Currently being spoken (shows in real-time)
    isListening,
    error,
    startListening,
    stopListening,
    segmentIndex
  };
}