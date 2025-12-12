# SimplifiED - Full Stack Architecture & Implementation Guide

## 🎯 Project Overview

SimplifiED is an AI-powered lecture transcription and simplification platform designed for students with dyslexia and reading challenges. It enables real-time transcription and intelligent processing of academic content.

---

## 📊 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                     │
│  Port: 5174 | Framework: Vite + React 19.2.0                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  • Authentication (Firebase Auth + Google OAuth)       │  │
│  │  • Real-time WebSocket for lecture transcription       │  │
│  │  • Web Audio API for recording                         │  │
│  │  • Web Speech API for transcription                    │  │
│  │  • Send text chunks every 5-10 seconds to backend      │  │
│  │  • Theme toggle (Dark/Light mode)                      │  │
│  │  • OpenDyslexic font for accessibility                 │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP/WebSocket
                               │ Real-time text chunks
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
│  Port: 3001 | Runtime: Node.js                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Receive Text Chunk → Process with Google Gemini:      │  │
│  │  ✓ Simplify to Simple English                          │  │
│  │  ✓ Generate Step-by-Step Explanation                   │  │
│  │  ✓ Create Clarity Notes (definitions, examples)        │  │
│  │  ✓ Extract Key Points                                  │  │
│  │  ✓ Generate Summary                                    │  │
│  │                                                         │  │
│  │  Save to Firestore → Frontend listens in real-time     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────┘
                               │ Firestore Real-time Sync
                               ▼
                        ┌─────────────────┐
                        │  Firestore      │
                        │  Real-time      │
                        │  Sync           │
                        └─────────────────┘
                               │
                        ┌──────────────────┐
                        │ Google Cloud     │
                        │ Storage          │
                        │ (Audio files)    │
                        └──────────────────┘
```

---

## 🗂️ Project Structure

### Frontend (`frontend/`)
```
frontend/
├── src/
│   ├── App.jsx                           # Main app component with routing
│   ├── main.jsx                          # Entry point
│   ├── index.css                         # Global styles + OpenDyslexic font
│   ├── pages/
│   │   ├── Landing.jsx                   # Public landing page
│   │   ├── Dashboard.jsx                 # User dashboard (protected)
│   │   └── TestSpeech.jsx                # Web Speech API test page
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx                # Reusable button component
│   │   │   ├── AuthModal.jsx             # Authentication modal
│   │   │   ├── Silk.jsx                  # Three.js animated background
│   │   │   └── Orb.jsx                   # 3D orb component (legacy)
│   │   ├── layout/
│   │   │   └── Navbar.jsx                # Navigation bar with auth
│   │   └── lecture/
│   │       └── AudioRecorder.jsx         # Audio recording component
│   ├── hooks/
│   │   └── useAudioRecorder.js           # Custom hook for audio recording
│   ├── context/
│   │   ├── ThemeContext.jsx              # Dark/Light mode state
│   │   └── AuthContext.jsx               # Firebase authentication state
│   ├── services/
│   │   └── firebase.js                   # Firebase client SDK (web API key)
│   └── assets/                           # Images and static files
├── package.json
├── vite.config.js
└── .env.local                            # Environment variables
```

### Backend (`backend/`)
```
backend/
├── src/
│   ├── index.js                          # Express server entry point
│   ├── routes/
│   │   ├── lecture.routes.js             # Lecture CRUD endpoints
│   │   └── segment.routes.js             # Segment processing endpoints
│   ├── controllers/
│   │   ├── lecture.controller.js         # Lecture business logic
│   │   └── segment.controller.js         # Segment processing logic
│   └── services/
│       ├── firebase.service.js           # Firebase Admin SDK (service account)
│       └── gemini.service.js             # Google Gemini AI integration
├── package.json
├── .env                                  # Environment variables (server-side)
└── node_modules/
```

---

## 🔑 API Endpoints

### Lectures API (`/api/lectures`)
```
POST   /api/lectures              # Create new lecture
GET    /api/lectures              # Get user's lectures
GET    /api/lectures/:lectureId   # Get specific lecture
PATCH  /api/lectures/:lectureId   # Update lecture (status, duration)
DELETE /api/lectures/:lectureId   # Delete lecture + segments
```

### Segments API (`/api/segments`)
```
POST /api/segments/process        # Process text segment with AI
GET  /api/segments/:lectureId     # Get all segments for lecture
GET  /api/segments/:lectureId/:segmentIndex  # Get specific segment
```

---

## 🔐 Authentication & Security

### Frontend Authentication
- **Provider**: Firebase Authentication
- **Methods**: Email/Password + Google OAuth
- **Configuration**: `frontend/.env.local` with `VITE_FIREBASE_*` keys
- **Web API Key**: Public key safe for browser operations

### Backend Authentication
- **Service Account**: Firebase Admin SDK
- **Configuration**: `backend/.env` with `FIREBASE_*` credentials
- **Private Key**: Server-side only (never expose to frontend)
- **Token Verification**: All backend routes require Firebase ID token

### Security Rules
```
Firestore:
- Users can only read/write their own lectures
- Segments inherit lecture permissions
- Backend has full admin access for AI processing

Storage:
- Users authenticated before upload
- Organized by userId/lectureId
```

---

## 🚀 Running the Application

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start server (development)
npm run dev

# Start server (production)
npm start

# Expected output:
# ✅ Firebase Admin initialized successfully
# 🚀 EchoNotes Backend Server
# 📍 Port: 3001
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Expected output:
# VITE v7.2.7 ready
# ➜ Local: http://localhost:5174/

# Build for production
npm run build
```

---

## 🔑 Environment Variables

### Frontend (`.env.local`)
```env
VITE_FIREBASE_API_KEY=your_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend (`.env`)
```env
# Server
PORT=3001
NODE_ENV=development

# Firebase Admin SDK (Service Account)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## 🧠 Google Gemini AI Features

Each text segment received by the backend is processed with these AI features:

### 1. **Text Simplification**
- Convert academic language to simple English
- Max 15 words per sentence
- Replace jargon with everyday terms
- Optimize for dyslexic readers

### 2. **Step-by-Step Explanation**
- Break complex concepts into numbered steps
- One idea per step
- Include real-world examples
- Visual and concrete language

### 3. **Clarity Notes**
- Identify difficult terms
- Provide simple definitions
- Give real-world examples
- Explain relevance

### 4. **Key Points Extraction**
- Identify main concepts
- Extract important definitions
- Highlight critical information

### 5. **Summary Generation**
- Concise overview of segment
- Main ideas highlighted
- Suitable for quick review

---

## 📱 Frontend Features

### Pages
1. **Landing Page** (`/`)
   - Public hero section with Silk shader background
   - Features overview
   - Authentication modal for signup/login
   - Dark/Light theme toggle

2. **Dashboard** (`/dashboard`)
   - Protected route (requires authentication)
   - User's lecture history
   - Quick start new lecture
   - View past notes

3. **New Lecture** (`/new-lecture`)
   - Audio recording interface
   - Real-time transcription with Web Speech API
   - Text chunk sending to backend
   - Live notes display

### Authentication
- **Login/Signup Modal**: Email/password or Google OAuth
- **User Menu**: Profile dropdown with logout
- **Protected Routes**: Redirect unauthenticated users to login
- **Persistent Login**: localStorage-based session

### UI/UX
- **OpenDyslexic Font**: Applied globally for accessibility
- **Dark/Light Mode**: Theme toggle with persistence
- **Silk Shader Background**: Three.js animated WebGL effect
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Accessible Components**: WCAG-compliant design

---

## 🔄 Real-Time Data Flow

### Recording a Lecture

```
1. User clicks "New Lecture" → Creates lecture in Firestore
   ├─ lectureId generated
   ├─ userId linked
   └─ status: "recording"

2. Frontend captures audio with Web Audio API
   └─ Web Speech API transcribes in real-time

3. Every 5-10 seconds, text chunk sent to backend:
   POST /api/segments/process
   {
     lectureId: "abc123",
     segmentIndex: 0,
     text: "The mitochondria is...",
     timestamp: 1702382400000
   }

4. Backend processes with Gemini AI:
   ├─ Simplifies text
   ├─ Generates explanations
   ├─ Extracts key points
   └─ Saves to Firestore

5. Firestore triggers real-time listener on frontend:
   └─ New segment appears instantly in UI
       ├─ Original transcription
       ├─ Simplified version
       ├─ Step-by-step breakdown
       ├─ Clarity notes
       └─ Key points

6. User stops recording → Lecture status: "completed"
```

---

## 🛠️ Technologies Used

### Frontend
- **React 19.2.0**: UI library
- **Vite 7.2.7**: Build tool
- **Tailwind CSS 4.1.17**: Styling
- **React Router 7.10.1**: Routing
- **Firebase SDK**: Authentication & Firestore
- **Three.js**: 3D graphics (Silk background)
- **Framer Motion**: Animations
- **Web APIs**: Audio recording, Speech recognition

### Backend
- **Express.js 5.2.1**: Web server
- **Firebase Admin SDK 13.6.0**: Database & Auth
- **Google Generative AI 0.24.1**: Gemini API
- **Socket.io 4.8.1**: Real-time communication
- **CORS 2.8.5**: Cross-origin handling
- **dotenv 17.2.3**: Environment variables

### Databases & Services
- **Firestore**: Real-time document database
- **Cloud Storage**: Audio file storage
- **Firebase Authentication**: User management
- **Google Gemini 1.5**: AI text processing

---

## 📋 Checklist

### ✅ Completed
- [x] Frontend landing page with Silk shader background
- [x] Dark/Light theme toggle
- [x] OpenDyslexic font integration
- [x] Firebase Authentication (email + Google OAuth)
- [x] Auth modal component
- [x] User profile and logout
- [x] Backend Express server
- [x] Firestore integration (Admin SDK)
- [x] Google Gemini AI integration
- [x] Lecture and Segment controllers
- [x] API endpoints for lectures and segments
- [x] Environment variable setup
- [x] Both frontend and backend running successfully

### 🚀 Ready to Implement
- [ ] Web Audio API recording in AudioRecorder component
- [ ] Web Speech API transcription
- [ ] Real-time segment processing
- [ ] Firestore real-time listeners on frontend
- [ ] User dashboard with lecture history
- [ ] Lecture playback with synchronized notes
- [ ] Export notes to PDF/text
- [ ] User settings page
- [ ] Advanced search functionality
- [ ] Sharing lectures with classmates

---

## 🐛 Troubleshooting

### Frontend Not Starting
```
Error: VITE_FIREBASE_* not found
→ Check .env.local has correct variable names (VITE_ prefix, not REACT_APP_)
→ Restart dev server after changing .env.local
```

### Backend Firebase Error
```
Error: Missing Firebase Admin SDK credentials
→ Check backend/.env has FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
→ Ensure FIREBASE_PRIVATE_KEY has proper newlines (use \n not literal newlines)
```

### Authentication Not Working
```
Error: Firebase config validation failed
→ Verify all 6 VITE_FIREBASE_* variables in frontend/.env.local
→ Check Firebase project settings for correct values
→ Ensure Firebase Authentication has Email and Google enabled
```

### CORS Errors
```
Error: Access-Control-Allow-Origin
→ Check ALLOWED_ORIGINS in backend/.env
→ Ensure frontend URL is in the comma-separated list
```

---

## 📚 Next Steps

1. **Implement AudioRecorder Component**
   - Web Audio API for recording
   - Web Speech API for transcription
   - Send chunks to backend

2. **Add Real-Time Listeners**
   - Firestore onSnapshot for segments
   - Display processed notes in real-time

3. **Build User Dashboard**
   - List user's lectures
   - View lecture notes
   - Delete/export lectures

4. **Advanced Features**
   - Lecture search
   - Notes sharing
   - PDF export
   - Flashcard generation

---

**Last Updated**: December 12, 2025  
**Status**: ✅ Backend & Frontend Running Successfully  
**Current Frontend Port**: 5174  
**Current Backend Port**: 3001
