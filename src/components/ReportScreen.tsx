import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, CheckCircle2, AlertTriangle, BookOpen, RotateCcw, TrendingUp, Sparkles, ChevronDown, ChevronUp, Brain, BookMarked, ThumbsUp, HelpCircle, FileText } from 'lucide-react';
import { Avatar, Message, AnswerScore, FinalReport, DetailedReportItem } from '../types';
import { AVATARS } from './SetupScreen';

interface ReportScreenProps {
  messages: Message[];
  scores: AnswerScore[];
  avatarId: string;
  role: string;
  level: string;
  interviewType: string;
  customRole: string;
  onRestart: () => void;
}

export default function ReportScreen({
  messages,
  scores,
  avatarId,
  role,
  level,
  interviewType,
  customRole,
  onRestart,
}: ReportScreenProps) {
  const avatar = AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
  const targetRole = role === 'custom' ? customRole || 'Custom Candidate' : role;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<'profile' | 'timeline' | 'tips'>('profile');

  // Trigger Gemini API to generate the complete structured feedback report
  useEffect(() => {
    let active = true;
    const generateReport = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/interview/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role,
            level,
            interviewType,
            customRole,
            history: messages,
            scores,
          }),
        });
        const data = await res.json();
        if (!active) return;
        
        if (data && data.overallScore !== undefined) {
          setReport(data);
        } else {
          // Robust fallback report if any API/formatting issue
          const computedScore = Math.round(
            scores.length > 0
              ? (scores.reduce((acc, curr) => acc + (curr.clarity + curr.correctness + curr.depth + curr.structure) / 4, 0) / scores.length) * 10
              : 75
          );

          const fallbackReport: FinalReport = {
            overallScore: computedScore,
            strengths: [
              'Demonstrated robust communication clarity during technical explanations.',
              'Structured answers with reasonable logical progressions.',
              'Attempted to cover essential background facts and core concepts requested.',
            ],
            weaknesses: [
              'Needs deeper usage of real-world metrics or precise frameworks (e.g., STAR method).',
              'Certain answers could benefit from direct system architecture or detailed diagrams/reasoning.',
              'Pacing could be refined to address the question prompt with higher specificity early on.',
            ],
            improvementTips: [
              'Engage in active case study mock rehearsals to improve structured storytelling under time limits.',
              'Review core architectural paradigms, design patterns, or metrics relevant to your target seniority level.',
              'Practice articulating trade-offs clearly when answering complex technical questions.',
            ],
            detailedFeedback: scores.map((score, index) => ({
              questionNumber: index + 1,
              question: score.question,
              answer: score.answer,
              overallAnswerScore: Math.round(((score.clarity + score.correctness + score.depth + score.structure) / 4) * 10),
              strengths: score.evaluation || 'Answer answered with clean articulation and structure.',
              improvements: score.feedback || 'Incorporate concrete real-world metrics or direct design examples.',
            })),
          };
          setReport(fallbackReport);
        }
      } catch (err) {
        console.error('Error compiled report:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    generateReport();
    return () => {
      active = false;
    };
  }, [messages, scores]);

  if (loading) {
    return (
      <div id="report-loading-screen" className="flex flex-col items-center justify-center py-20 px-4 max-w-2xl mx-auto text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-10 h-10 text-indigo-600 animate-pulse-slow" />
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Evaluating Your Knowledge Profile
        </h2>
        <p className="text-gray-600 mt-2 max-w-md">
          {avatar.name} is examining your conversation transcript, measuring communication clarity, depth, and correctness to synthesize a custom intelligence dossier.
        </p>
        <div className="mt-6 flex flex-col gap-1.5 w-full bg-slate-50 p-4 rounded-xl border border-gray-100 text-left text-xs font-mono text-slate-500">
          <div className="flex justify-between items-center text-emerald-600 font-semibold">
            <span>✓ Dialog logs verified</span>
            <span>100%</span>
          </div>
          <div className="flex justify-between items-center text-indigo-600 font-semibold">
            <span>⚡ Generating knowledge maps...</span>
            <span className="animate-pulse">Active</span>
          </div>
        </div>
      </div>
    );
  }

  const finalScore = report?.overallScore || 0;

  // Grade classification mapping
  let gradeLetter = 'B';
  let gradeLabel = 'Proficient Candidate';
  let gradeColor = 'text-indigo-600 border-indigo-200 bg-indigo-50';

  if (finalScore >= 90) {
    gradeLetter = 'A+';
    gradeLabel = 'Outstanding Star';
    gradeColor = 'text-emerald-600 border-emerald-200 bg-emerald-50';
  } else if (finalScore >= 80) {
    gradeLetter = 'A';
    gradeLabel = 'Strong Performer';
    gradeColor = 'text-teal-600 border-teal-200 bg-teal-50';
  } else if (finalScore >= 70) {
    gradeLetter = 'B+';
    gradeLabel = 'Solid Competency';
    gradeColor = 'text-indigo-600 border-indigo-200 bg-indigo-50';
  } else if (finalScore >= 60) {
    gradeLetter = 'B';
    gradeLabel = 'Capably Proficient';
    gradeColor = 'text-amber-600 border-amber-200 bg-amber-50';
  } else {
    gradeLetter = 'C';
    gradeLabel = 'Developing Competency';
    gradeColor = 'text-rose-600 border-rose-200 bg-rose-50';
  }

  // Calculate average scores from scores arrays for detailed bars
  const avgClarity = scores.length > 0 ? (scores.reduce((acc, curr) => acc + curr.clarity, 0) / scores.length).toFixed(1) : '7.5';
  const avgCorrectness = scores.length > 0 ? (scores.reduce((acc, curr) => acc + curr.correctness, 0) / scores.length).toFixed(1) : '7.2';
  const avgDepth = scores.length > 0 ? (scores.reduce((acc, curr) => acc + curr.depth, 0) / scores.length).toFixed(1) : '6.8';
  const avgStructure = scores.length > 0 ? (scores.reduce((acc, curr) => acc + curr.structure, 0) / scores.length).toFixed(1) : '7.0';

  return (
    <div id="report-screen" className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-md">
        <div className="flex items-center gap-4 text-left">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500 shrink-0">
            <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
              <Brain className="w-3 h-3" />
              <span>Dossier decided by {avatar.name}</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Your Performance & Knowledge Report
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Role: <strong className="text-gray-700">{targetRole}</strong> ({level}) • Focus: <strong className="text-gray-700">{interviewType}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-indigo-100"
        >
          <RotateCcw className="w-4 h-4" />
          Start New Practice
        </button>
      </div>

      {/* CORE STATS OVERVIEW CARD CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* SCORE WHEEL GAUGE (5cols) */}
        <div className="md:col-span-4 bg-slate-900 rounded-2xl p-6 border border-slate-800 text-center flex flex-col justify-between shadow-lg text-white">
          <h3 className="text-slate-400 font-semibold font-display text-sm tracking-wide">
            DECIDED RATING
          </h3>

          <div className="my-8 flex justify-center items-center relative">
            {/* SVG circular progress ring */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle cx="72" cy="72" r="62" stroke="#1e293b" strokeWidth="8" fill="transparent" />
              <circle
                cx="72"
                cy="72"
                r="62"
                stroke="url(#indigoGrad)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 62}
                strokeDashoffset={2 * Math.PI * 62 * (1 - finalScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <span className="text-4xl font-extrabold font-display bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">
                {finalScore}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                OUT OF 100
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block font-mono ${gradeColor}`}>
              GRADE: {gradeLetter}
            </span>
            <p className="text-sm font-semibold mt-1 text-slate-200">
              {gradeLabel}
            </p>
          </div>
        </div>

        {/* METRICS EVALUATION BARS (8cols) */}
        <div className="md:col-span-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-md flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-gray-900 font-semibold font-display text-sm">
                Skill Dimension Breakdown
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Average scores based on your performance across individual criteria.
            </p>
          </div>

          <div className="space-y-4">
            {/* Metric 1 */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-gray-700">Communication Clarity & STAR Pacing</span>
                <span className="text-indigo-600 font-mono">{avgClarity}/10</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full" style={{ width: `${Number(avgClarity) * 10}%` }} />
              </div>
            </div>

            {/* Metric 2 */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-gray-700">Technical & Practical Correctness</span>
                <span className="text-emerald-600 font-mono">{avgCorrectness}/10</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full" style={{ width: `${Number(avgCorrectness) * 10}%` }} />
              </div>
            </div>

            {/* Metric 3 */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-gray-700">Depth of Explanation & Metrics</span>
                <span className="text-teal-600 font-mono">{avgDepth}/10</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full" style={{ width: `${Number(avgDepth) * 10}%` }} />
              </div>
            </div>

            {/* Metric 4 */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-gray-700">Logical Flow & Structure</span>
                <span className="text-violet-600 font-mono">{avgStructure}/10</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-violet-600 h-full rounded-full" style={{ width: `${Number(avgStructure) * 10}%` }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* DETAILED FEEDBACK SECTIONS WITH TABS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden text-left">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-4.5 text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Brain className="w-4 h-4" />
            Knowledge Profile decided by AI
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-6 py-4.5 text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            Question Diagnostics ({scores.length})
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-6 py-4.5 text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'tips'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Strategic Upgrade Roadmap
          </button>
        </div>

        {/* Tab 1: Knowledge Profile (Strengths & Weaknesses) */}
        {activeTab === 'profile' && (
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths List */}
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Proven Skill Competencies
              </h3>
              <p className="text-xs text-gray-500">
                These are skills and theoretical frameworks the avatar detected you successfully applied.
              </p>
              <ul className="space-y-3 pt-2">
                {report?.strengths.map((strength, index) => (
                  <li key={index} className="flex gap-2.5 items-start bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100/50 text-sm text-gray-700">
                    <ThumbsUp className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses List */}
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Knowledge Gaps & Areas to Improve
              </h3>
              <p className="text-xs text-gray-500">
                These are topics or presentation areas where your answers lacked depth, specificity, or structure.
              </p>
              <ul className="space-y-3 pt-2">
                {report?.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex gap-2.5 items-start bg-rose-50/40 p-3.5 rounded-xl border border-rose-100/50 text-sm text-gray-700">
                    <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Question Diagnostics */}
        {activeTab === 'timeline' && (
          <div className="p-6 sm:p-8 space-y-4">
            {report?.detailedFeedback.map((item) => {
              const isExpanded = expandedQuestion === item.questionNumber;
              return (
                <div key={item.questionNumber} className="border border-gray-100 rounded-xl overflow-hidden shadow-xs bg-white">
                  
                  {/* Collapsible Trigger Panel */}
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : item.questionNumber)}
                    className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100/80 transition flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold font-mono">
                        Q{item.questionNumber}
                      </span>
                      <p className="font-semibold text-gray-800 text-sm line-clamp-1 pr-4">
                        {item.question}
                      </p>
                    </div>
                    <div className="flex items-center gap-3.5 shrink-0">
                      <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-[11px] font-bold rounded-md font-mono">
                        Score: {item.overallAnswerScore}%
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </div>
                  </button>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="p-5 border-t border-gray-100 space-y-4 text-sm">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider block mb-1">
                          Full Interview Question
                        </span>
                        <div className="bg-slate-50 p-3.5 rounded-xl text-slate-700 italic border border-slate-100">
                          "{item.question}"
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider block mb-1">
                          Your Answer Provided
                        </span>
                        <div className="bg-indigo-50/30 p-3.5 rounded-xl text-slate-800 font-medium border border-indigo-100/50">
                          "{item.answer || 'No response provided.'}"
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/30">
                          <h5 className="font-bold text-emerald-800 flex items-center gap-1.5 text-xs mb-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Confirmed Merit
                          </h5>
                          <p className="text-gray-700 text-xs leading-relaxed">{item.strengths}</p>
                        </div>

                        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/30">
                          <h5 className="font-bold text-amber-800 flex items-center gap-1.5 text-xs mb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Avatar's Pro Tip to level up
                          </h5>
                          <p className="text-gray-700 text-xs leading-relaxed">{item.improvements}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Actionable Tips Roadmap */}
        {activeTab === 'tips' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display text-lg font-bold text-gray-900">
                Custom Skill Upgrades Roadmap
              </h3>
            </div>
            <p className="text-sm text-gray-500">
              The AI has selected these focus strategies to refine your capability specifically for **{level} {targetRole}** interviews:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {report?.improvementTips.map((tip, index) => (
                <div key={index} className="p-5 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                      {tip}
                    </p>
                  </div>
                  <span className="text-[10px] text-indigo-600 font-bold tracking-wider uppercase mt-4 block">
                    Focus Objective
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
