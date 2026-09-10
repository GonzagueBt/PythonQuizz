import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ExamRecord, ProgressState } from "@/types";
import {
  addExamRecord,
  loadProgress,
  recordAttempt,
  resetProgress,
  saveProgress,
  toggleDifficult,
  toggleFavorite,
} from "@/engine/progressStore";

interface ProgressContextValue {
  progress: ProgressState;
  recordAnswer: (questionId: string, correct: boolean, timeMs?: number) => void;
  toggleFavoriteQuestion: (questionId: string) => void;
  toggleDifficultQuestion: (questionId: string) => void;
  logExam: (exam: ExamRecord) => void;
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  const update = useCallback((updater: (state: ProgressState) => ProgressState) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  const recordAnswer = useCallback(
    (questionId: string, correct: boolean, timeMs?: number) => {
      update((prev) => recordAttempt(prev, questionId, correct, timeMs));
    },
    [update],
  );

  const toggleFavoriteQuestion = useCallback(
    (questionId: string) => update((prev) => toggleFavorite(prev, questionId)),
    [update],
  );

  const toggleDifficultQuestion = useCallback(
    (questionId: string) => update((prev) => toggleDifficult(prev, questionId)),
    [update],
  );

  const logExam = useCallback((exam: ExamRecord) => update((prev) => addExamRecord(prev, exam)), [update]);

  const reset = useCallback(() => setProgress(resetProgress()), []);

  const value = useMemo(
    () => ({ progress, recordAnswer, toggleFavoriteQuestion, toggleDifficultQuestion, logExam, reset }),
    [progress, recordAnswer, toggleFavoriteQuestion, toggleDifficultQuestion, logExam, reset],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
