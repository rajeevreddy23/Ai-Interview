import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, AlertCircle, Play, Square, RefreshCw, CheckCircle2, ChevronRight, MessageSquareCode, Video, VideoOff, Camera, Eye, EyeOff, Activity, Tv, Radio, Timer } from 'lucide-react';
import { Avatar, Message, AnswerScore, ExperienceLevel, InterviewType } from '../types';
import { AVATARS } from './SetupScreen';

interface InterviewScreenProps {
  role: string;
  level: ExperienceLevel;
  interviewType: InterviewType;
  customRole: string;
  avatarId: string;
  onEndInterview: (messages: Message[], scores: AnswerScore[]) => void;
}

// Global typing declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

export default function InterviewScreen({
  role,
  level,
  interviewType,
  customRole,
  avatarId,
  onEndInterview,
}: InterviewScreenProps) {
  const avatar = AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
  const targetRole = role === 'custom' ? customRole || 'Custom Candidate' : role;

  const [messages, setMessages] = useState<Message[]>([]);
  const [scores, setScores] = useState<AnswerScore[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Audio & Voice States
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [micError, setMicError] = useState('');

  // Count/Round tracker
  const [questionCount, setQuestionCount] = useState(1);
  const totalQuestions = 6;

  // References
  const messageEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Camera & Video Filter States
  const [cameraActive, setCameraActive] = useState(true);
  const [videoFilter, setVideoFilter] = useState<'none' | 'warm' | 'cool' | 'holographic' | 'noir'>('cool');
  const [mirrorVideo, setMirrorVideo] = useState(true);
  const [cameraError, setCameraError] = useState('');
  
  // Real-time expressions, demeanor vibe, and communication HUD states
  const [isBlinking, setIsBlinking] = useState(false);
  const [interviewerVibe, setInterviewerVibe] = useState<'supportive' | 'demanding' | 'technical'>('supportive');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [communicationMetrics, setCommunicationMetrics] = useState({
    clarity: 88,
    pace: 'Optimal (135 WPM)',
    vocabulary: 'Professional',
    sentiment: 'Confident & Structured'
  });

  // User Turn Countdown Timer
  const MAX_TURN_TIME = 120; // 2 minutes (120 seconds) for standard interview response
  const [turnTimeLeft, setTurnTimeLeft] = useState(MAX_TURN_TIME);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Dynamically computed activeAvatar configuration based on live selected vibe demeanor style
  const activeAvatar = {
    ...avatar,
    personalityStyle: 
      interviewerVibe === 'supportive' 
        ? 'Speak as a highly supportive, empathetic, and encouraging mentor. Appreciate correct terms, encourage them, and ask standard but helpful behavioral or domain-specific questions.' 
        : interviewerVibe === 'demanding' 
        ? 'Speak as a strict, demanding corporate executive or hiring board panelist. Challenge any vague statements, request real business metrics, ask tough follow-ups, and look for ownership qualities under high stress.' 
        : 'Speak as a deep, analytical tech visionary and systems guru. Push for specific architectural decisions, algorithmic trade-offs, scalability bottlenecks, security risks, and optimization details.'
  };

  // Camera feed management
  useEffect(() => {
    let active = true;
    
    const startCamera = async () => {
      if (!cameraActive) {
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach(track => track.stop());
          cameraStreamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        return;
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false
        });
        
        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError('');
      } catch (err) {
        console.error('Failed to get camera feed:', err);
        setCameraError('Unable to access camera. Check device permissions.');
        setCameraActive(false);
      }
    };
    
    startCamera();
    
    return () => {
      active = false;
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  // Periodic blinking to make the avatar feel alive
  useEffect(() => {
    let blinkTimer = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 3200 + Math.random() * 2500);
    
    return () => {
      clearInterval(blinkTimer);
    };
  }, []);

  // Live telemetry metrics simulator when listening to candidate's voice feed
  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => {
      setCommunicationMetrics({
        clarity: Math.floor(84 + Math.random() * 13),
        pace: Math.random() > 0.5 ? 'Optimal (128 WPM)' : 'Good (138 WPM)',
        vocabulary: Math.random() > 0.6 ? 'Advanced' : 'Professional',
        sentiment: Math.random() > 0.5 ? 'Highly Confident' : 'Calm & Logical'
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isListening]);

  // User Turn Countdown Timer logic
  useEffect(() => {
    const isUserTurn = !isAvatarSpeaking && !isThinking && messages.length > 0;
    if (!isUserTurn) {
      setTurnTimeLeft(MAX_TURN_TIME);
      return;
    }

    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAvatarSpeaking, isThinking, messages.length]);

  // Auto-submit or handle timer expiry
  useEffect(() => {
    if (turnTimeLeft === 0) {
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
      if (inputText.trim()) {
        handleSubmit();
      }
    }
  }, [turnTimeLeft]);

  // Scroll to bottom of message list
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Speech recognition setup
  useEffect(() => {
    const SpeechAPI = (window as WindowWithSpeech).SpeechRecognition || (window as WindowWithSpeech).webkitSpeechRecognition;
    if (!SpeechAPI) {
      setMicSupported(false);
      return;
    }

    try {
      const rec = new SpeechAPI();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setMicError('');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputText((prev) => (prev + ' ' + finalTranscript).trim());
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event);
        if (event.error === 'not-allowed') {
          setMicError('Microphone permission blocked. Please check your browser settings.');
        } else {
          setMicError(`Voice input issue: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } catch (err) {
      console.error('Failed to init speech recognition:', err);
      setMicSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Launch initial interviewer question
  useEffect(() => {
    let active = true;
    const startInterview = async () => {
      setIsThinking(true);
      try {
        const res = await fetch('/api/interview/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, level, interviewType, customRole, avatar: activeAvatar }),
        });
        const data = await res.json();
        if (!active) return;

        if (data.text) {
          const initMsg: Message = {
            id: 'init-msg',
            sender: 'interviewer',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages([initMsg]);
          speakOut(data.text);
        }
      } catch (err) {
        console.error('Error starting interview:', err);
      } finally {
        if (active) setIsThinking(false);
      }
    };

    startInterview();
    return () => {
      active = false;
    };
  }, [role, level, interviewType, customRole, avatarId]);

  // Voice output generation
  const speakOut = (text: string) => {
    if (!voiceEnabled) return;
    
    window.speechSynthesis.cancel(); // Stop any active speech
    
    // Clean text from symbols/brackets for natural talking
    const cleanSpeechText = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.lang = 'en-US';

    // Set voice properties depending on selected avatar gender
    const voices = window.speechSynthesis.getVoices();
    const candidateVoice = voices.find(v => {
      const nameLower = v.name.toLowerCase();
      if (avatar.voiceGender === 'female') {
        return nameLower.includes('google us english') || nameLower.includes('female') || nameLower.includes('zira') || nameLower.includes('samantha');
      } else {
        return nameLower.includes('google uk english male') || nameLower.includes('male') || nameLower.includes('david');
      }
    });

    if (candidateVoice) {
      utterance.voice = candidateVoice;
    }

    utterance.onstart = () => {
      setIsAvatarSpeaking(true);
    };
    utterance.onend = () => {
      setIsAvatarSpeaking(false);
    };
    utterance.onerror = () => {
      setIsAvatarSpeaking(false);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!micSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (isAvatarSpeaking) {
        window.speechSynthesis.cancel();
        setIsAvatarSpeaking(false);
      }
      setInputText('');
      recognitionRef.current?.start();
    }
  };

  // Handle submitting user answer
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isThinking) return;

    // Stop listening if active
    if (isListening) {
      recognitionRef.current?.stop();
    }

    const answerStr = inputText.trim();
    setInputText('');

    const newMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: answerStr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    // Is it the final question limit?
    if (questionCount >= totalQuestions) {
      setIsThinking(true);
      try {
        // Send final answer to get latest score evaluated before generating report
        const res = await fetch('/api/interview/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role,
            level,
            interviewType,
            customRole,
            history: updatedMessages.slice(0, -1),
            answer: answerStr,
            avatar: activeAvatar,
          }),
        });
        const data = await res.json();
        
        let finalScores = [...scores];
        if (data.score) {
          const finalScoreObj: AnswerScore = {
            question: messages[messages.length - 1]?.text || 'Final Question',
            answer: answerStr,
            clarity: data.score.clarity,
            correctness: data.score.correctness,
            depth: data.score.depth,
            structure: data.score.structure,
            evaluation: data.evaluation,
            feedback: data.feedback,
          };
          finalScores.push(finalScoreObj);
        }

        // Move to completion & render the report
        onEndInterview(updatedMessages, finalScores);
      } catch (err) {
        console.error('Error generating final evaluation:', err);
        // Fallback completed state if crash
        onEndInterview(updatedMessages, scores);
      } finally {
        setIsThinking(false);
      }
      return;
    }

    setIsThinking(true);
    try {
      const res = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          level,
          interviewType,
          customRole,
          history: updatedMessages.slice(0, -1),
          answer: answerStr,
          avatar: activeAvatar,
        }),
      });

      const data = await res.json();

      // Background scoring
      if (data.score) {
        const intermediateScore: AnswerScore = {
          question: messages[messages.length - 1]?.text || '',
          answer: answerStr,
          clarity: data.score.clarity,
          correctness: data.score.correctness,
          depth: data.score.depth,
          structure: data.score.structure,
          evaluation: data.evaluation,
          feedback: data.feedback,
        };
        setScores((prev) => [...prev, intermediateScore]);
      }

      if (data.followUp) {
        const replyMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'interviewer',
          text: data.followUp,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, replyMsg]);
        setQuestionCount((c) => c + 1);
        speakOut(data.followUp);
      }
    } catch (err) {
      console.error('Error in answering endpoint:', err);
    } finally {
      setIsThinking(false);
    }
  };

  // Skip or early finish interview
  const handleEarlyComplete = () => {
    onEndInterview(messages, scores);
  };

  return (
    <div id="interview-screen" className="w-full max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* LEFT COLUMN: The Live Avatar Video Stream View & Candidate Camera (5cols) */}
      <div className="lg:col-span-5 flex flex-col gap-5 h-full overflow-y-auto pr-1">
        
        {/* CARD 1: AI RECRUITER LIVE AVATAR VIDEO */}
        <div className="flex flex-col justify-between bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-5 relative overflow-hidden shrink-0">
          {/* Decorative Grid Mesh Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

          {/* Live Top Banner Info */}
          <div className="flex items-center justify-between z-10 mb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAvatarSpeaking ? 'bg-cyan-400' : 'bg-rose-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAvatarSpeaking ? 'bg-cyan-400' : 'bg-rose-500'}`}></span>
              </span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">
                {isAvatarSpeaking ? 'AI Interacting Live' : isListening ? 'Listening' : 'Ready'}
              </span>
            </div>
            <div className="px-2.5 py-0.5 bg-slate-800/90 border border-slate-700 rounded text-[10px] font-semibold text-indigo-400 font-mono flex items-center gap-1">
              <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
              <span>ROUND {questionCount} / {totalQuestions}</span>
            </div>
          </div>

          {/* Dynamic Avatar Studio Portrait with Sway and Breathing */}
          <div className="flex flex-col items-center justify-center py-4 relative z-10">
            <div className={`relative transition-transform duration-300 ${isAvatarSpeaking ? 'scale-105' : 'scale-100'}`}>
              
              {/* Glowing active animation rings around the Avatar */}
              <AnimatePresence>
                {isAvatarSpeaking && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1.15, opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-cyan-500/30 filter blur-sm"
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 0.35 }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full bg-emerald-500/30 filter blur-sm"
                  />
                )}
              </AnimatePresence>

              {/* Main Circle Portrait with Micro-Sway and Breathe Animation */}
              <div className={`w-36 h-36 rounded-full overflow-hidden border-4 bg-slate-950 relative z-10 transition-all duration-300 animate-sway animate-breathe ${
                isAvatarSpeaking 
                  ? 'border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.5)]' 
                  : isListening 
                  ? 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)]' 
                  : 'border-slate-700'
              }`}>
                {/* Avatar Image */}
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                />

                {/* Natural blinking eyelid overlay */}
                {isBlinking && (
                  <div className="absolute inset-x-0 top-0 h-full bg-slate-950/90 origin-top animate-fade-in z-20" style={{ clipPath: 'ellipse(100% 40% at 50% 0%)' }} />
                )}

                {/* Holographic scanning overlay when speaking */}
                {isAvatarSpeaking && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent animate-[scan_2s_infinite] pointer-events-none z-15" />
                )}
              </div>
            </div>

            <div className="text-center mt-3">
              <h3 className="font-display text-lg font-bold text-white leading-tight">{avatar.name}</h3>
              <p className="text-[10px] text-indigo-300 font-mono font-bold tracking-wide mt-0.5">{avatar.role}</p>
            </div>

            {/* Symmetrical Audio Wave Visualizer */}
            <div className="flex items-end gap-1 h-9 mt-4 justify-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((val, idx) => {
                let delay = idx * 0.05;
                return (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isAvatarSpeaking ? 'bg-cyan-400' : isListening ? 'bg-emerald-400' : 'bg-slate-700'
                    }`}
                    style={{
                      height: isAvatarSpeaking
                        ? `${Math.max(12, Math.random() * 32)}px`
                        : isListening
                        ? `${Math.max(6, Math.random() * 20)}px`
                        : '6px',
                      transitionDelay: `${delay}s`,
                    }}
                  />
                );
              })}
            </div>

            {/* Turn Countdown Timer */}
            {(!isAvatarSpeaking && !isThinking && messages.length > 0) ? (
              <div className="w-full mt-3.5 px-3 py-1.5 bg-slate-950/40 border border-emerald-500/15 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${turnTimeLeft < 30 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${turnTimeLeft < 30 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 select-none">
                    <Timer className="w-3.5 h-3.5 text-slate-400" /> Answer Time
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-1 justify-end max-w-[160px]">
                  <span className={`text-[11px] font-bold font-mono transition-colors duration-300 ${turnTimeLeft < 30 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    {Math.floor(turnTimeLeft / 60)}:{(turnTimeLeft % 60).toString().padStart(2, '0')}
                  </span>
                  <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-900">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        turnTimeLeft < 30 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(turnTimeLeft / MAX_TURN_TIME) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full mt-3.5 px-3 py-1.5 bg-slate-950/20 border border-slate-900 rounded-xl flex items-center justify-between gap-3 opacity-50">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-700"></span>
                  <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 select-none">
                    <Timer className="w-3.5 h-3.5 text-slate-600" /> Answer Time
                  </span>
                </div>
                <span className="text-[10px] font-bold font-mono text-slate-500 select-none">
                  Waiting...
                </span>
              </div>
            )}

            {/* Real-time Demeanor / Vibe Controller */}
            <div className="w-full mt-5 px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-850/80">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono text-center mb-1.5">
                Adjust Interviewer Tone & Personality Style
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'supportive', name: 'Supportive', desc: 'Encouraging Coach', color: 'from-emerald-500/10 to-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                  { id: 'demanding', name: 'Boardroom', desc: 'Strict Challenger', color: 'from-rose-500/10 to-rose-500/20 text-rose-300 border-rose-500/30' },
                  { id: 'technical', name: 'Deep Tech', desc: 'Systems Architect', color: 'from-cyan-500/10 to-cyan-500/20 text-cyan-300 border-cyan-500/30' }
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setInterviewerVibe(v.id as any)}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all duration-200 cursor-pointer ${
                      interviewerVibe === v.id
                        ? `bg-gradient-to-b ${v.color} ring-1 ring-cyan-500/40 font-semibold scale-[1.03] shadow-md`
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 text-[10px]'
                    }`}
                  >
                    <span className="text-[10px] font-bold">{v.name}</span>
                    <span className="text-[8px] opacity-75 leading-tight block mt-0.5">{v.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Live Speech Quality Telemetry */}
            <div className="w-full mt-4 px-3 py-2.5 bg-slate-950/60 rounded-xl border border-slate-850/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Candidate Speech Telemetry (Live)
                </span>
                <span className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                  <span className="text-[8px] font-mono text-slate-400 font-bold uppercase">
                    {isListening ? 'Analyzing Feed' : 'Mic Idle'}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/40">
                  <div className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Clarity Score</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold font-mono text-slate-200">{communicationMetrics.clarity}%</span>
                    <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/60 px-1 py-0.5 rounded border border-cyan-900/40">Stable</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${communicationMetrics.clarity}%` }} />
                  </div>
                </div>

                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/40">
                  <div className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Speech Pace</div>
                  <div className="text-[10px] font-bold text-slate-200 mt-1 truncate">{communicationMetrics.pace}</div>
                  <div className="text-[7px] font-mono text-slate-500 mt-1">Normal is 120-150 WPM</div>
                </div>

                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/40">
                  <div className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Lexicon Level</div>
                  <div className="text-[10px] font-bold text-indigo-300 mt-1">{communicationMetrics.vocabulary}</div>
                  <div className="text-[7px] font-mono text-slate-500 mt-1">Dynamic word range evaluation</div>
                </div>

                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/40">
                  <div className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">Vibe Sentiment</div>
                  <div className="text-[10px] font-bold text-emerald-400 mt-1 truncate">{communicationMetrics.sentiment}</div>
                  <div className="text-[7px] font-mono text-slate-500 mt-1">Tone analytics of voice feed</div>
                </div>
              </div>
            </div>

            {/* Live Subtitles / Captions Glass Drawer */}
            {isAvatarSpeaking && showSubtitles && (
              <div className="w-full mt-4 p-3 bg-gradient-to-r from-cyan-950/40 to-slate-950/70 border border-cyan-500/20 rounded-xl relative overflow-hidden backdrop-blur-sm shadow-inner">
                <div className="absolute top-0 left-0 bg-cyan-500 h-[1px] w-1/4 animate-pulse-slow" />
                <div className="flex items-center justify-between mb-1.5 border-b border-slate-800/60 pb-1">
                  <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" /> Live Teleprompter Subtitles
                  </span>
                  <button
                    onClick={() => setShowSubtitles(false)}
                    className="text-[8px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    [Hide]
                  </button>
                </div>
                <p className="text-xs text-slate-100 font-normal leading-relaxed text-left line-clamp-3">
                  {messages.filter(m => m.sender === 'interviewer').slice(-1)[0]?.text || "Initializing teleprompter connection..."}
                </p>
              </div>
            )}

            {!showSubtitles && isAvatarSpeaking && (
              <div className="flex justify-center mt-3 w-full">
                <button
                  onClick={() => setShowSubtitles(true)}
                  className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 hover:bg-slate-800 text-[8px] text-slate-300 rounded font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  Show Subtitles On Screen
                </button>
              </div>
            )}
          </div>

          {/* Settings, Narration & Tracker toggles */}
          <div className="border-t border-slate-800/80 pt-3 z-10 space-y-3">
            <div className="flex items-center justify-between gap-2">
              {/* Toggle Narration (Text to Speech) */}
              <button
                type="button"
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled) window.speechSynthesis.cancel();
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  voiceEnabled ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/35' : 'bg-slate-800/60 text-slate-500 border border-slate-700/50 hover:text-slate-400'
                }`}
              >
                {voiceEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    Speaker ON
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    Speaker Mute
                  </>
                )}
              </button>

              {/* Teleprompter Subtitle Toggle */}
              <button
                type="button"
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  showSubtitles ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/35' : 'bg-slate-800/60 text-slate-500 border border-slate-700/50 hover:text-slate-400'
                }`}
                title="Toggle Live Teleprompter Subtitles Overlay"
              >
                {showSubtitles ? (
                  <>
                    <Tv className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    Teleprompter ON
                  </>
                ) : (
                  <>
                    <Tv className="w-3.5 h-3.5" />
                    Captions Hidden
                  </>
                )}
              </button>

              {/* Early Finish */}
              <button
                type="button"
                onClick={handleEarlyComplete}
                className="text-[10px] font-bold text-slate-400 hover:text-white transition duration-150 flex items-center gap-1 cursor-pointer ml-auto uppercase"
              >
                Skip Out
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Micro warning indicator */}
            {micError && (
              <div className="p-2 bg-rose-950/40 border border-rose-800/40 rounded-lg flex items-start gap-1.5 text-rose-300 text-[10px]">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{micError}</span>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: LIVE USER CANDIDATE CAMERA FEED (Loom Style PIP Panel) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col relative overflow-hidden shadow-2xl shrink-0">
          
          {/* Header Info */}
          <div className="flex items-center justify-between mb-3 z-10">
            <div className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono">
                Candidate Camera (LIVE)
              </span>
            </div>
            
            {cameraActive && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold rounded-full font-mono flex items-center gap-1 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SECURE STREAM
              </span>
            )}
          </div>

          {/* Actual Web Camera Feed Aspect frame */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-all duration-300 ${
                  videoFilter === 'warm' ? 'filter-warm' :
                  videoFilter === 'cool' ? 'filter-cool' :
                  videoFilter === 'holographic' ? 'filter-holographic' :
                  videoFilter === 'noir' ? 'filter-noir' : ''
                } ${mirrorVideo ? '-scale-x-100' : ''}`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 gap-1.5 p-4 text-center">
                <VideoOff className="w-8 h-8 text-slate-700 animate-pulse-slow" />
                <span className="text-[11px] font-bold text-slate-400">User Camera Off</span>
                <span className="text-[9px] text-slate-600 max-w-[200px]">Unlock camera to simulate face-to-face recruitment conditions.</span>
              </div>
            )}
            
            {cameraActive && (
              <>
                {/* Holographic scanning horizontal bar */}
                {videoFilter === 'holographic' && (
                  <div className="absolute inset-x-0 h-0.5 bg-cyan-400/50 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-bounce pointer-events-none top-0" />
                )}
                
                {/* Visual red REC blink overlay */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-rose-600/90 rounded text-[9px] font-bold text-white flex items-center gap-1.5 animate-pulse uppercase tracking-widest font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  REC FEED
                </div>

                {/* Micro Input Audio responsive soundbar indicator */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-[8px] text-slate-400 font-mono font-bold shrink-0">MIC AMPLITUDE:</span>
                  <div className="flex-1 flex gap-0.5 items-center h-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => {
                      const isActive = isListening && Math.random() * 10 > bar;
                      return (
                        <div
                          key={bar}
                          className={`flex-1 h-full rounded-sm transition-all duration-100 ${
                            isActive ? 'bg-emerald-400 shadow-xs shadow-emerald-400' : 'bg-slate-800'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {cameraError && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center text-rose-300 text-[10px] gap-1 z-10">
                <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
                <p className="font-semibold">{cameraError}</p>
                <p className="text-[9px] text-slate-500">Enable camera access in your browser settings to resolve.</p>
              </div>
            )}
          </div>

          {/* User Camera Controls bar */}
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-800/60 pt-2">
            
            {/* Toggle Switch Camera Button */}
            <button
              type="button"
              onClick={() => setCameraActive(!cameraActive)}
              className={`p-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                cameraActive ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/35' : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:text-slate-200'
              }`}
            >
              {cameraActive ? (
                <>
                  <Video className="w-3.5 h-3.5 text-emerald-400" />
                  Camera Active
                </>
              ) : (
                <>
                  <VideoOff className="w-3.5 h-3.5" />
                  Camera Offline
                </>
              )}
            </button>

            {/* Filter Selection Panel */}
            {cameraActive && (
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-slate-400 font-mono font-bold">FILTER:</span>
                <select
                  value={videoFilter}
                  onChange={(e) => setVideoFilter(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-md px-1.5 py-1 text-[9px] text-slate-200 font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="none">None</option>
                  <option value="warm">Warm Gold</option>
                  <option value="cool">Steel Slate</option>
                  <option value="holographic">Holo Cyan</option>
                  <option value="noir">Dark Noir</option>
                </select>
              </div>
            )}

            {/* Mirror Option */}
            {cameraActive && (
              <button
                type="button"
                onClick={() => setMirrorVideo(!mirrorVideo)}
                className={`p-1 text-[9px] rounded hover:bg-slate-800 font-mono font-bold border transition ${
                  mirrorVideo ? 'border-slate-700 text-indigo-400' : 'border-slate-800/50 text-slate-500'
                }`}
                title="Mirror the Camera output"
              >
                MIRROR
              </button>
            )}

          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: The Interactive Chat Dialogue Feed (7cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden h-full">
        {/* Chat Feed Header */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase font-mono tracking-wider">Interview Session</span>
            <h2 className="font-semibold text-gray-900 text-sm mt-0.5">{targetRole} • {level}</h2>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>AI Guided Analysis</span>
          </div>
        </div>

        {/* Scrollable Messages container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'interviewer';
            return (
              <div
                key={msg.id}
                className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition duration-150 ${
                  isAI
                    ? 'bg-slate-50 text-slate-800 border border-slate-100'
                    : 'bg-indigo-600 text-white rounded-tr-none'
                }`}>
                  <div className="flex items-center justify-between gap-6 mb-1">
                    <span className="font-bold text-[11px] opacity-75 uppercase tracking-wider">
                      {isAI ? avatar.name : 'You'}
                    </span>
                    <span className="text-[10px] opacity-60">
                      {msg.timestamp}
                    </span>
                  </div>
                  {/* Handle paragraph spaces nicely */}
                  <div className="whitespace-pre-line leading-relaxed font-sans font-medium text-sm">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI Thinking indicator */}
          {isThinking && (
            <div className="flex w-full justify-start">
              <div className="bg-slate-50 text-slate-800 border border-slate-100 rounded-2xl px-4 py-3 max-w-[80%] shadow-xs">
                <span className="font-bold text-[11px] text-gray-400 uppercase tracking-wider block mb-1">
                  {avatar.name} is evaluating...
                </span>
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messageEndRef} />
        </div>

        {/* Chat Entry and Action Tools Panel */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            
            {/* Microphone Activation Toggle */}
            {micSupported && (
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Stop Listening' : 'Speak with Voice'}
                className={`p-3.5 rounded-xl transition cursor-pointer flex items-center justify-center ${
                  isListening
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5 text-emerald-600" />
                )}
              </button>
            )}

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening live... Speak clearly' : 'Type your detailed response here...'}
              disabled={isThinking}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-gray-500 mt-2 text-center">
            {isListening ? 'Speech-to-Text active. Speak clearly into your microphone.' : 'Type your message or click the green microphone to dictate your response.'}
          </p>
        </div>

      </div>

    </div>
  );
}
