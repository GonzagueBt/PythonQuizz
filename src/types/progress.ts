import type { Level, Topic } from "./question";

export interface AttemptRecord {
  at: number;
  correct: boolean;
  timeMs?: number;
}

export interface QuestionProgress {
  questionId: string;
  attempts: number;
  correctCount: number;
  incorrectCount: number;
  lastAttemptAt: number;
  lastCorrect: boolean | null;
  everCorrect: boolean;
  favorite: boolean;
  markedDifficult: boolean;
  /** Most recent attempts only (bounded, newest last). */
  history: AttemptRecord[];
}

export interface ExamRecord {
  id: string;
  startedAt: number;
  finishedAt: number;
  level: Level | "mixed";
  topics: Topic[];
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  weakTopics: Topic[];
  questionIds: string[];
  answeredCorrectly: string[];
}

export interface StreakState {
  current: number;
  best: number;
  /** ISO date (YYYY-MM-DD) of the last day with at least one answer. */
  lastActiveDay: string | null;
}

export interface ProgressState {
  version: 1;
  createdAt: number;
  questions: Record<string, QuestionProgress>;
  exams: ExamRecord[];
  streak: StreakState;
}

export const emptyQuestionProgress = (questionId: string): QuestionProgress => ({
  questionId,
  attempts: 0,
  correctCount: 0,
  incorrectCount: 0,
  lastAttemptAt: 0,
  lastCorrect: null,
  everCorrect: false,
  favorite: false,
  markedDifficult: false,
  history: [],
});

export const emptyProgressState = (): ProgressState => ({
  version: 1,
  createdAt: Date.now(),
  questions: {},
  exams: [],
  streak: { current: 0, best: 0, lastActiveDay: null },
});
