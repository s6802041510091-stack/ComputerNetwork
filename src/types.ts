export interface User {
  studentId: string;
  name: string;
  classroom: string;
  role: 'student' | 'admin';
  sheetUrl?: string; // Users can optionally configure their Google Sheets Web App URL
}

export type LessonId = 'lesson1' | 'lesson2';

export interface ExerciseQuestion {
  id: string;
  type: 'choice' | 'boolean' | 'matching' | 'fill' | 'order' | 'scenario';
  question: string;
  options?: string[]; // Used for choice/fill/scenario
  answer: string | boolean | string[]; // Correct answer(s)
  pairs?: { left: string; right: string }[]; // Used for matching
  orderItems?: string[]; // Used for ordering
  explanation: string;
}

export interface Lesson {
  id: LessonId;
  title: string;
  icon: string;
  estimatedTime: string;
  objectives: string[];
  subsections: {
    title: string;
    content: string;
    subContent?: { subtitle: string; text: string }[];
  }[];
  videoUrl: string;
  videoTitle: string;
  videoDescription: string;
  thoughtQuestion: string;
  exampleBox: {
    title: string;
    description: string;
  };
  triviaBox: {
    title: string;
    content: string;
  };
  summaryPoints: string[];
  exerciseQuestions: ExerciseQuestion[];
}

export interface LessonProgress {
  attemptId: string;
  lessonId: LessonId;
  lessonName: string;
  status: 'not_started' | 'studying' | 'completed';
  lastScore: number;
  maxScore: number;
  totalQuestions: number;
  attemptsCount: number;
  dateStarted: string;
  dateCompleted: string;
  dateUpdated: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface QuizResult {
  quizType: 'pre' | 'post';
  score: number;
  maxScore: number;
  dateCompleted: string;
  answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[];
}

export interface GameResult {
  score: number;
  timeSeconds: number;
  datePlayed: string;
}

export interface HistoryLog {
  id: string;
  activityName: string;
  statusDetails: string;
  timestamp: string;
}

export interface AppState {
  currentUser: User | null;
  lessonProgress: Record<LessonId, LessonProgress>;
  preTestResult: QuizResult | null;
  postTestResults: QuizResult[]; // Keep multiple post test results
  gameResults: GameResult[];
  historyLogs: HistoryLog[];
  googleSheetsUrl: string; // Global configured webapp URL
}
