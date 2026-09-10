import type { ExamRecord, ProgressState, QuestionProgress } from "@/types";
import { emptyProgressState, emptyQuestionProgress } from "@/types";

const STORAGE_KEY = "ptl_progress_v1";
const MAX_HISTORY_PER_QUESTION = 20;

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return emptyProgressState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgressState();
    const parsed = JSON.parse(raw) as ProgressState;
    if (!parsed || parsed.version !== 1) return emptyProgressState();
    return parsed;
  } catch {
    return emptyProgressState();
  }
}

export function saveProgress(state: ProgressState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable (private mode) — fail silently, in-memory
    // state for this session still works.
  }
}

export function resetProgress(): ProgressState {
  const fresh = emptyProgressState();
  saveProgress(fresh);
  return fresh;
}

function todayIso(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.round((Date.parse(b) - Date.parse(a)) / msPerDay);
}

function bumpStreak(state: ProgressState): ProgressState {
  const today = todayIso();
  const { lastActiveDay } = state.streak;
  if (lastActiveDay === today) return state;

  let current = 1;
  if (lastActiveDay) {
    const gap = daysBetween(lastActiveDay, today);
    current = gap === 1 ? state.streak.current + 1 : 1;
  }
  const best = Math.max(state.streak.best, current);
  return { ...state, streak: { current, best, lastActiveDay: today } };
}

/** Records an attempt on a question and returns a brand new state object. */
export function recordAttempt(
  state: ProgressState,
  questionId: string,
  correct: boolean,
  timeMs?: number,
): ProgressState {
  const previous = state.questions[questionId] ?? emptyQuestionProgress(questionId);
  const now = Date.now();
  const history = [...previous.history, { at: now, correct, timeMs }].slice(
    -MAX_HISTORY_PER_QUESTION,
  );

  const updated: QuestionProgress = {
    ...previous,
    attempts: previous.attempts + 1,
    correctCount: previous.correctCount + (correct ? 1 : 0),
    incorrectCount: previous.incorrectCount + (correct ? 0 : 1),
    lastAttemptAt: now,
    lastCorrect: correct,
    everCorrect: previous.everCorrect || correct,
    history,
  };

  const withQuestion: ProgressState = {
    ...state,
    questions: { ...state.questions, [questionId]: updated },
  };
  return bumpStreak(withQuestion);
}

export function toggleFavorite(state: ProgressState, questionId: string): ProgressState {
  const previous = state.questions[questionId] ?? emptyQuestionProgress(questionId);
  const updated: QuestionProgress = { ...previous, favorite: !previous.favorite };
  return { ...state, questions: { ...state.questions, [questionId]: updated } };
}

export function toggleDifficult(state: ProgressState, questionId: string): ProgressState {
  const previous = state.questions[questionId] ?? emptyQuestionProgress(questionId);
  const updated: QuestionProgress = { ...previous, markedDifficult: !previous.markedDifficult };
  return { ...state, questions: { ...state.questions, [questionId]: updated } };
}

export function addExamRecord(state: ProgressState, exam: ExamRecord): ProgressState {
  return { ...state, exams: [...state.exams, exam].slice(-50) };
}

/** A question is considered "hard" once it has enough attempts and a low success rate. */
export function isAutoDifficult(progress: QuestionProgress | undefined): boolean {
  if (!progress || progress.attempts < 2) return false;
  return progress.correctCount / progress.attempts < 0.5;
}
