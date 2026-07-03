import { motion } from 'motion/react';
import { Calendar, Trash2, ArrowLeft, Trophy, BarChart3, CheckSquare, Sparkles, User, Brain, ExternalLink } from 'lucide-react';
import { InterviewSession } from '../types';
import { AVATARS } from './SetupScreen';

interface HistoryScreenProps {
  sessions: InterviewSession[];
  onViewSession: (session: InterviewSession) => void;
  onDeleteSession: (id: string) => void;
  onBack: () => void;
}

export default function HistoryScreen({
  sessions,
  onViewSession,
  onDeleteSession,
  onBack,
}: HistoryScreenProps) {
  
  // Calculate aggregate metrics
  const totalCompleted = sessions.filter((s) => s.status === 'completed' && s.report).length;
  
  const scores = sessions
    .filter((s) => s.status === 'completed' && s.report)
    .map((s) => s.report?.overallScore || 0);

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((acc, curr) => acc + curr, 0) / scores.length) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

  return (
    <div id="history-screen" className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Header with Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Setup
        </button>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Interview Dossiers & History
        </h1>
      </div>

      {/* Aggregate Stats Dashboard */}
      {totalCompleted > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Stat 1 */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/40 p-5 rounded-2xl border border-indigo-100 text-left flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-xl text-white">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-indigo-800 font-semibold uppercase tracking-wider block">Sessions Finished</span>
              <span className="text-2xl font-bold text-gray-900 mt-0.5">{totalCompleted}</span>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-5 rounded-2xl border border-emerald-100 text-left flex items-center gap-4">
            <div className="p-3 bg-emerald-600 rounded-xl text-white">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider block">Average Rating</span>
              <span className="text-2xl font-bold text-gray-900 mt-0.5">{avgScore}/100</span>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 p-5 rounded-2xl border border-amber-100 text-left flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-xl text-white">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-amber-800 font-semibold uppercase tracking-wider block">Peak Score achieved</span>
              <span className="text-2xl font-bold text-gray-900 mt-0.5">{maxScore}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Table / List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden text-left">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900 text-sm">Completed Assessments</h3>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <Brain className="w-12 h-12 text-gray-300 mx-auto animate-pulse-slow" />
            <h4 className="font-bold text-gray-800">No Interview Logs Found</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Launch and complete your first mock interview. Your performance analytics, strengths, and advice reports will be saved right here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((session) => {
              const avatar = AVATARS.find((a) => a.id === session.avatarId) || AVATARS[0];
              const targetRole = session.role === 'custom' ? session.customRole || 'Custom Candidate' : session.role;
              const formattedDate = new Date(session.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div key={session.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/50 transition duration-150">
                  <div className="flex items-center gap-4">
                    {/* Tiny Avatar portrait */}
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 shrink-0">
                      <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{targetRole}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide font-medium">
                        {session.level} • {session.interviewType}
                      </p>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    {session.report && (
                      <div className="text-right">
                        <span className="text-xs font-semibold text-gray-400 block uppercase font-mono">Score</span>
                        <span className="text-lg font-bold text-indigo-600 font-display">
                          {session.report.overallScore}%
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewSession(session)}
                        className="px-4 py-2 border border-gray-200 hover:border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Analysis Report
                      </button>
                      
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-2 border border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition cursor-pointer"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
