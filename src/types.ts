export type ExperienceLevel = 'fresher' | 'mid' | 'senior';
export type InterviewType = 'technical' | 'behavioral' | 'hr' | 'mixed';

export interface Avatar {
  id: string;
  name: string;
  role: string;
  image: string;
  color: string;
  badgeClass: string;
  borderClass: string;
  glowClass: string;
  personalityStyle: string;
  voiceGender: 'female' | 'male';
}

export interface Message {
  id: string;
  sender: 'interviewer' | 'user';
  text: string;
  timestamp: string;
}

export interface AnswerScore {
  question: string;
  answer: string;
  clarity: number;      // 1-10
  correctness: number;  // 1-10
  depth: number;        // 1-10
  structure: number;    // 1-10
  evaluation: string;
  feedback: string;
}

export interface DetailedReportItem {
  questionNumber: number;
  question: string;
  answer: string;
  overallAnswerScore: number; // 0-100
  strengths: string;
  improvements: string;
}

export interface FinalReport {
  overallScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  detailedFeedback: DetailedReportItem[];
}

export interface InterviewSession {
  id: string;
  role: string;
  customRole?: string;
  level: ExperienceLevel;
  interviewType: InterviewType;
  avatarId: string;
  status: 'setup' | 'interviewing' | 'completed';
  messages: Message[];
  scores: AnswerScore[];
  report?: FinalReport;
  createdAt: string;
}
