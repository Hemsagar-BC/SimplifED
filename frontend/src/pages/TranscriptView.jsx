import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../components/layout/Navbar';
import Silk from '../components/common/Silk';
import MindMapVisualization from '../components/lecture/MindMapVisualization';

const TranscriptView = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('simple');

  // Fetch lecture data from Firebase
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        console.log('📥 Fetching lecture:', lectureId);
        const lectureRef = doc(db, 'lectures', lectureId);
        const lectureSnap = await getDoc(lectureRef);

        if (lectureSnap.exists()) {
          const data = lectureSnap.data();
          console.log('✅ Lecture data loaded:', data);
          console.log('Fetched AI results:', {
            simpleSummary: data.simpleSummary,
            stepByStepExplanation: data.stepByStepExplanation,
            summary: data.summary,
            mindMap: data.mindMap,
          });
          setLecture(data);
        } else {
          console.error('❌ Lecture not found');
          alert('Lecture not found');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('❌ Error fetching lecture:', error);
        alert('Error loading lecture');
      } finally {
        setLoading(false);
      }
    };

    if (lectureId) {
      fetchLecture();
    }
  }, [lectureId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen relative bg-black overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 w-full h-full bg-linear-to-br from-black via-blue-950 to-slate-950 pointer-events-none z-0"></div>
        <div className="fixed inset-0 w-full h-full pointer-events-none opacity-60 z-0">
          <Silk speed={8} scale={1.5} color="#3B82F6" noiseIntensity={0.7} rotation={0.3} />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-300 font-semibold text-lg">Loading lecture...</p>
        </div>
      </div>
    );
  }

  if (!lecture) {
    return null;
  }

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Silk Background */}
      <div className="fixed inset-0 w-full h-full bg-linear-to-br from-black via-blue-950 to-slate-950 pointer-events-none z-0"></div>

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="mb-4 px-4 py-2 bg-gray-700/50 text-gray-200 rounded-lg hover:bg-gray-600/50 transition-all"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">
              📚 {lecture.title}
            </h1>
            <p className="text-lg text-blue-200">
              Recorded on {new Date(lecture.createdAt?.toDate()).toLocaleDateString()} • 
              Duration: {Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, '0')}
            </p>
          </div>

          {/* Main Container - Two Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-fit lg:h-[600px]">
            {/* Left Side - Original Transcript */}
            <div className="bg-linear-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                📝 Original Transcript
              </h2>
              <div className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 overflow-y-auto">
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {lecture.transcript || 'No transcript available'}
                </p>
              </div>
            </div>

            {/* Right Side - AI-Powered Insights */}
            <div className="bg-linear-to-br from-purple-900/80 to-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-4">✨ AI-Powered Insights</h2>

              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  { id: 'simple', label: 'Simple Text', icon: '📄' },
                  { id: 'detailed', label: 'Detailed Steps', icon: '🔍' },
                  { id: 'mindmap', label: 'Mind Map', icon: '🧠' },
                  { id: 'summary', label: 'Summary', icon: '📝' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 overflow-y-auto">
                {activeTab === 'simple' && (
                  <div>
                    <h3 className="text-lg font-bold text-green-400 mb-3">📄 Simple Explanation</h3>
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-base">
                      {lecture.Summary || 'No simplified explanation available'}
                    </p>
                  </div>
                )}

                {activeTab === 'detailed' && (
                  <div>
                    <h3 className="text-lg font-bold text-blue-400 mb-3">🔍 Detailed Steps</h3>
                    <div className="text-gray-200 leading-relaxed space-y-2">
                      {lecture.detailedSteps?.split('\n').map((step, idx) => (
                        step.trim() && (
                          <div key={idx} className="flex gap-3">
                            <span className="text-blue-400 font-bold shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        )
                      ))}
                      {!lecture.stepByStepExplanation && <p>No detailed steps available</p>}
                    </div>
                  </div>
                )}

                {activeTab === 'mindmap' && (
                  <div className="h-[500px]">
                    <MindMapVisualization mindMapData={lecture.mindMap} />
                  </div>
                )}

                {activeTab === 'summary' && (
                  <div>
                    <h3 className="text-lg font-bold text-emerald-400 mb-3">📝 Summary</h3>
                    <div className="bg-linear-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 rounded-xl p-5">
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-lg">
                        {lecture.summary || 'No summary available'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptView;
