import { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Layers, MessageSquare, Terminal, UserPlus, Sparkles, Wand2, UserCheck, TrendingUp, Palette } from 'lucide-react';
import { ExperienceLevel, InterviewType, Avatar } from '../types';

import ariaImg from '../assets/images/avatar_aria_1783100617017.jpg';
import ethanImg from '../assets/images/avatar_ethan_1783100629064.jpg';
import sophiaImg from '../assets/images/avatar_sophia_1783100642280.jpg';
import marcusImg from '../assets/images/avatar_marcus_1783101096901.jpg';
import danielImg from '../assets/images/avatar_daniel_1783101121174.jpg';

interface SetupScreenProps {
  onStart: (role: string, level: ExperienceLevel, interviewType: InterviewType, customRole: string, avatarId: string) => void;
  onViewHistory: () => void;
  hasHistory: boolean;
}

const ROLES = [
  { id: 'SDE', name: 'Software Developer', icon: Terminal, desc: 'Algorithms, systems, clean code, design patterns' },
  { id: 'Data Scientist', name: 'Data Scientist', icon: Layers, desc: 'Analytics, machine learning, probability, stats' },
  { id: 'Product Manager', name: 'Product Manager', icon: Briefcase, desc: 'Product strategy, prioritization, metrics, market' },
  { id: 'Finance Manager', name: 'Finance & Strategy', icon: TrendingUp, desc: 'Corporate finance, valuations, budgeting, forecasting' },
  { id: 'Creative Designer', name: 'Creative UI/UX & Marketing', icon: Palette, desc: 'Brand positioning, UX design, user testing, acquisition' },
  { id: 'custom', name: 'Custom Role...', icon: UserPlus, desc: 'Define your own custom target job position' },
];

const LEVELS: { id: ExperienceLevel; name: string; range: string }[] = [
  { id: 'fresher', name: 'Fresher / Junior', range: '0 - 2 years' },
  { id: 'mid', name: 'Mid-Level', range: '3 - 5 years' },
  { id: 'senior', name: 'Senior / Lead', range: '5+ years' },
];

const TYPES: { id: InterviewType; name: string; desc: string }[] = [
  { id: 'technical', name: 'Technical Focus', desc: 'Coding, system design, architectural principles, domain knowledge' },
  { id: 'behavioral', name: 'Behavioral / STAR', desc: 'Leadership, collaboration, conflict resolution, past experience' },
  { id: 'hr', name: 'HR & Cultural Fit', desc: 'Salary, career goals, remote/office alignment, growth mindset' },
  { id: 'mixed', name: 'Mixed Round', desc: 'A diverse combination of technical, behavioral, and cultural questions' },
];

export const AVATARS: Avatar[] = [
  {
    id: 'aria',
    name: 'Aria',
    role: 'Lead Systems Architect & Tech Lead',
    image: ariaImg,
    color: 'text-cyan-600 bg-cyan-50/50 border-cyan-200',
    badgeClass: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    borderClass: 'border-cyan-500 bg-cyan-50/10',
    glowClass: 'shadow-cyan-100/50 ring-2 ring-cyan-500',
    personalityStyle: 'Speak as a highly logical, precise, yet supportive engineering lead. Ask deep probing system and technical questions. Be brief and expect crisp, logical explanations.',
    voiceGender: 'female',
  },
  {
    id: 'ethan',
    name: 'Ethan',
    role: 'Director of Talent Acquisition & HR Coach',
    image: ethanImg,
    color: 'text-amber-600 bg-amber-50/50 border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    borderClass: 'border-amber-500 bg-amber-50/10',
    glowClass: 'shadow-amber-100/50 ring-2 ring-amber-500',
    personalityStyle: 'Speak as an extremely warm, empathetic, and encouraging HR coach. Focus heavily on collaboration, conflict resolution, values alignment, and behavioral answers.',
    voiceGender: 'male',
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Startup Co-founder & VP of Product',
    image: sophiaImg,
    color: 'text-violet-600 bg-violet-50/50 border-violet-200',
    badgeClass: 'bg-violet-100 text-violet-800 border border-violet-200',
    borderClass: 'border-violet-500 bg-violet-50/10',
    glowClass: 'shadow-violet-100/50 ring-2 ring-violet-500',
    personalityStyle: 'Speak as an energetic, ambitious, data-driven founder. Focus on business value, resourcefulness, product-market fit, prioritization, metrics, and ownership mindsets.',
    voiceGender: 'female',
  },
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Senior Finance & Strategy Director',
    image: marcusImg,
    color: 'text-emerald-600 bg-emerald-50/50 border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    borderClass: 'border-emerald-500 bg-emerald-50/10',
    glowClass: 'shadow-emerald-100/50 ring-2 ring-emerald-500',
    personalityStyle: 'Speak as a seasoned, sharp, yet professional Finance Director. Ask questions about business models, revenue projection, unit economics, risk mitigation, and strategic growth. Actively assess quantitative reasoning.',
    voiceGender: 'male',
  },
  {
    id: 'daniel',
    name: 'Daniel',
    role: 'VP of Creative Design & Brand Marketing',
    image: danielImg,
    color: 'text-purple-600 bg-purple-50/50 border-purple-200',
    badgeClass: 'bg-purple-100 text-purple-800 border border-purple-200',
    borderClass: 'border-purple-500 bg-purple-50/10',
    glowClass: 'shadow-purple-100/50 ring-2 ring-purple-500',
    personalityStyle: 'Speak as an enthusiastic, visionary creative director and growth marketer. Focus on user empathy, visual/interaction design, product positioning, content strategy, brand identity, and customer acquisition metrics.',
    voiceGender: 'male',
  },
];

export default function SetupScreen({ onStart, onViewHistory, hasHistory }: SetupScreenProps) {
  const [selectedRole, setSelectedRole] = useState('SDE');
  const [customRole, setCustomRole] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>('mid');
  const [selectedType, setSelectedType] = useState<InterviewType>('mixed');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('aria');

  const handleStart = () => {
    if (selectedRole === 'custom' && !customRole.trim()) {
      return;
    }
    onStart(selectedRole, selectedLevel, selectedType, customRole, selectedAvatar);
  };

  return (
    <div id="setup-screen" className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 animate-pulse-slow text-indigo-500" />
          <span>Generative AI Live Interview Room</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          Prepare with <span className="text-indigo-600 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">MockMind Live</span>
        </h1>
        <p className="mt-3 text-lg text-gray-600 max-w-xl mx-auto">
          Choose a personal AI interviewer avatar and experience a fully spoken, live interview. The avatar will dynamically assess your exact knowledge levels.
        </p>

        {hasHistory && (
          <button
            id="view-history-btn"
            onClick={onViewHistory}
            className="mt-5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition duration-150 inline-flex items-center gap-1.5 border border-indigo-200 hover:border-indigo-300 px-4 py-1.5 rounded-full bg-white shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            View Past Interviews & Stats
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 space-y-8">
        
        {/* Step 1: Select AI Interviewer Avatar */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-900 font-display">
            1. Select Your Live AI Interviewer Avatar
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {AVATARS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id;
              return (
                <button
                  key={avatar.id}
                  id={`avatar-opt-${avatar.id}`}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`flex flex-col text-left rounded-2xl border-2 overflow-hidden transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? `${avatar.borderClass} ${avatar.glowClass} scale-[1.02]`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                    <img
                      src={avatar.image}
                      alt={avatar.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-semibold uppercase ${avatar.badgeClass}`}>
                      {avatar.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-3 right-3 p-1 bg-indigo-600 text-white rounded-full">
                        <UserCheck className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{avatar.name}</h4>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{avatar.role}</p>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-3 italic">
                        "{avatar.personalityStyle}"
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Choose Role */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 font-display">
            2. What job position are you preparing for?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  id={`role-opt-${role.id}`}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex flex-col text-left p-4 rounded-xl border-2 transition duration-200 cursor-pointer h-full ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg inline-flex mb-3 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">{role.name}</span>
                  <span className="text-xs text-gray-500 mt-1 line-clamp-2">{role.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Role Input Box */}
          {selectedRole === 'custom' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <input
                id="custom-role-input"
                type="text"
                placeholder="E.g., Senior iOS Engineer, DevOps Engineer, UX Researcher..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm"
              />
            </motion.div>
          )}
        </div>

        {/* Step 3: Experience Level */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 font-display">
            3. Choose your experience tier
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {LEVELS.map((level) => {
              const isSelected = selectedLevel === level.id;
              return (
                <button
                  key={level.id}
                  id={`level-opt-${level.id}`}
                  type="button"
                  onClick={() => setSelectedLevel(level.id)}
                  className={`flex flex-col text-left p-4 rounded-xl border-2 transition duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <span className="font-medium text-gray-900 text-sm">{level.name}</span>
                  <span className="text-xs text-gray-500 mt-1">{level.range}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Interview Focus */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 font-display">
            4. Select interview focus type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TYPES.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  id={`type-opt-${type.id}`}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`flex flex-col text-left p-4 rounded-xl border-2 transition duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <span className="font-medium text-gray-900 text-sm">{type.name}</span>
                  <span className="text-xs text-gray-500 mt-1">{type.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Section */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-xs text-gray-500">
              Your live interview comprises 6 rounds of interactive verbal and written dialogue.
            </p>
            <p className="text-xs text-indigo-600 font-semibold mt-0.5">
              Mic Voice Input and real-time audio synthesis are supported!
            </p>
          </div>
          <button
            id="start-interview-btn"
            onClick={handleStart}
            disabled={selectedRole === 'custom' && !customRole.trim()}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-md hover:shadow-lg transition duration-150 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            Launch Live Interview
          </button>
        </div>
      </div>
    </div>
  );
}
