// ─── Module & Lesson ──────────────────────────────────────────────────────────

export type ModuleStatus = 'locked' | 'not_started' | 'in_progress' | 'completed';
export type LessonStatus = 'not_started' | 'in_progress' | 'completed';
export type TopicTag =
  | 'infant-feeding'
  | 'tummy-time'
  | 'screen-time'
  | 'sleep'
  | 'development'
  | 'caregiver-wellbeing';

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  durationMinutes: number;
  videoThumb: string; // color swatch or emoji for placeholder
  bodyContent: string; // simple HTML or markdown-ish string
  resources: { label: string; url: string }[];
  order: number;
  status: LessonStatus;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  tag: TopicTag;
  estimatedMinutes: number;
  lessons: Lesson[];
  quizId: string;
  order: number;
  status: ModuleStatus;
  completedLessons: number;
  publishState: 'published' | 'draft';
}

// ─── Quiz & Questions ─────────────────────────────────────────────────────────

export type QuestionType = 'multiple_choice' | 'matching' | 'short_text' | 'multi_select' | 'scale';

export interface ChoiceOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  moduleId: string;
  quizId: string;
  type: QuestionType;
  prompt: string;
  options?: ChoiceOption[];      // multiple_choice, multi_select
  pairs?: MatchingPair[];        // matching
  scaleMin?: number;             // scale
  scaleMax?: number;
  scaleLabels?: [string, string];
  correctAnswer?: string;        // short_text model answer
  points: number;
  order: number;
}

export interface QuizResult {
  questionId: string;
  answer: string | string[];
  isCorrect?: boolean;
  score?: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  moduleId: string;
  quizId: string;
  completedAt: string;
  results: QuizResult[];
  totalScore: number;
  maxScore: number;
  passed: boolean;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export type UserRole = 'participant' | 'admin';
export type ParticipantStatus = 'active' | 'inactive' | 'completed' | 'enrolled';

export interface ModuleProgress {
  moduleId: string;
  status: ModuleStatus;
  completedLessons: number;
  totalLessons: number;
  quizScore?: number;
  quizMaxScore?: number;
  lastAccessedAt?: string;
  completedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cohort: string;
  status: ParticipantStatus;
  enrolledAt: string;
  lastActiveAt: string;
  progress: ModuleProgress[];
  tags?: string[];
  notes?: string;
}

// ─── App state ────────────────────────────────────────────────────────────────

export interface AppState {
  currentUser: User | null;
  role: UserRole | null;
}
