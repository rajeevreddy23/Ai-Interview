import { useState, useEffect } from 'react';
import { Brain, Sparkles, MessageSquare, History, User, Github } from 'lucide-react';
import { InterviewSession, Message, AnswerScore, ExperienceLevel, InterviewType } from './types';
import SetupScreen from './components/SetupScreen';
import InterviewScreen from './components/InterviewScreen';
import ReportScreen from './components/ReportScreen';
import HistoryScreen from './components/HistoryScreen';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'setup' | 'interviewing' | 'report' | 'history'>('setup');
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mockmind_sessions');
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load session history:', err);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  const saveSessions = (updated: InterviewSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem('mockmind_sessions', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save session history:', err);
    }
  };

  const handleStartInterview = (
    role: string,
    level: ExperienceLevel,
    interviewType: InterviewType,
    customRole: string,
    avatarId: string
  ) => {
    const newSession: InterviewSession = {
      id: `session-${Date.now()}`,
      role,
      customRole,
      level,
      interviewType,
      avatarId,
      status: 'interviewing',
      messages: [],
      scores: [],
      createdAt: new Date().toISOString(),
    };

    setCurrentSession(newSession);
    setActiveScreen('interviewing');
  };

  const handleEndInterview = (messages: Message[], scores: AnswerScore[]) => {
    if (!currentSession) return;

    // Calculate overallScore based on all accumulated criteria
    const compositeScore = Math.round(
      scores.length > 0
        ? (scores.reduce((acc, curr) => acc + (curr.clarity + curr.correctness + curr.depth + curr.structure) / 4, 0) / scores.length) * 10
        : 75
    );

    // Create a temporary mock-friendly structure that will be immediately updated
    // by the ReportScreen calling the /api/interview/report endpoint in the background.
    const completedSession: InterviewSession = {
      ...currentSession,
      status: 'completed',
      messages,
      scores,
      report: {
        overallScore: compositeScore,
        strengths: [
          'Strong command of fundamental terminology and architectural patterns.',
          'Presented explanations clearly and structure them well.'
        ],
        weaknesses: [
          'Could expand on quantitative metrics or specific case examples.',
          'Trade-offs analysis could be described in greater technical detail.'
        ],
        improvementTips: [
          'Incorporate exact metrics or real-world outcomes into descriptions.',
          'Rehearse technical concepts using structural methodologies (e.g. STAR, CAR).'
        ],
        detailedFeedback: scores.map((s, idx) => ({
          questionNumber: idx + 1,
          question: s.question,
          answer: s.answer,
          overallAnswerScore: Math.round(((s.clarity + s.correctness + s.depth + s.structure) / 4) * 10),
          strengths: s.evaluation || 'Answer demonstrated satisfactory foundational clarity.',
          improvements: s.feedback || 'Focus on offering detailed trade-offs or design diagrams.',
        })),
      },
    };

    setCurrentSession(completedSession);
    
    // Save to overall history
    const updatedSessions = [completedSession, ...sessions];
    saveSessions(updatedSessions);
    
    setActiveScreen('report');
  };

  // Callback to persist the detailed synthesized feedback report when loaded inside ReportScreen
  useEffect(() => {
    if (activeScreen === 'report' && currentSession?.report) {
      const idx = sessions.findIndex((s) => s.id === currentSession.id);
      if (idx !== -1) {
        const updated = [...sessions];
        updated[idx] = currentSession;
        // Only update local storage state if the report changed or was generated
        if (JSON.stringify(sessions[idx]?.report) !== JSON.stringify(currentSession.report)) {
          saveSessions(updated);
        }
      }
    }
  }, [currentSession, activeScreen]);

  const handleViewPastSession = (session: InterviewSession) => {
    setCurrentSession(session);
    setActiveScreen('report');
  };

  const handleDeleteSession = (id: string) => {
    if (window.confirm('Are you sure you want to delete this interview record? This cannot be undone.')) {
      const filtered = sessions.filter((s) => s.id !== id);
      saveSessions(filtered);
    }
  };

  const handleRestart = () => {
    setCurrentSession(null);
    setActiveScreen('setup');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between font-sans text-gray-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* GLOBAL MASTER BANNER */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={handleRestart}
            className="flex items-center gap-2.5 text-left hover:opacity-90 transition cursor-pointer"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-gray-900 leading-none block">MockMind</span>
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5 block">AI Live Recruiter</span>
            </div>
          </button>

          {/* Navigation controls */}
          <div className="flex items-center gap-3">
            {activeScreen !== 'history' && sessions.length > 0 && (
              <button
                id="header-nav-history"
                onClick={() => setActiveScreen('history')}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-100 hover:bg-indigo-50/50 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" />
                History ({sessions.length})
              </button>
            )}

            {activeScreen === 'history' && (
              <button
                id="header-nav-practice"
                onClick={() => setActiveScreen('setup')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer shadow-sm shadow-indigo-100"
              >
                Launch Interview
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CORE CANVAS WORKSPACE */}
      <main className="flex-1 flex flex-col items-center justify-center py-6">
        {activeScreen === 'setup' && (
          <SetupScreen
            onStart={handleStartInterview}
            onViewHistory={() => setActiveScreen('history')}
            hasHistory={sessions.length > 0}
          />
        )}

        {activeScreen === 'interviewing' && currentSession && (
          <InterviewScreen
            role={currentSession.role}
            level={currentSession.level}
            interviewType={currentSession.interviewType}
            customRole={currentSession.customRole || ''}
            avatarId={currentSession.avatarId}
            onEndInterview={handleEndInterview}
          />
        )}

        {activeScreen === 'report' && currentSession && (
          <ReportScreen
            messages={currentSession.messages}
            scores={currentSession.scores}
            avatarId={currentSession.avatarId}
            role={currentSession.role}
            level={currentSession.level}
            interviewType={currentSession.interviewType}
            customRole={currentSession.customRole || ''}
            onRestart={handleRestart}
          />
        )}

        {activeScreen === 'history' && (
          <HistoryScreen
            sessions={sessions}
            onViewSession={handleViewPastSession}
            onDeleteSession={handleDeleteSession}
            onBack={handleRestart}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-gray-100 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 MockMind. Fully spoken Generative AI interactive interview platform.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Powered by Gemini 3.5 Flash
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
