import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyProgressState } from "@/types";
import { isAutoDifficult, recordAttempt, toggleDifficult, toggleFavorite } from "@/engine/progressStore";

describe("recordAttempt", () => {
  it("creates progress for a previously unseen question", () => {
    const state = emptyProgressState();
    const next = recordAttempt(state, "q1", true);
    expect(next.questions.q1.attempts).toBe(1);
    expect(next.questions.q1.correctCount).toBe(1);
    expect(next.questions.q1.everCorrect).toBe(true);
  });

  it("accumulates attempts across calls without mutating the previous state", () => {
    let state = emptyProgressState();
    state = recordAttempt(state, "q1", false);
    const afterFirst = state;
    state = recordAttempt(state, "q1", true);
    expect(afterFirst.questions.q1.attempts).toBe(1);
    expect(state.questions.q1.attempts).toBe(2);
    expect(state.questions.q1.correctCount).toBe(1);
    expect(state.questions.q1.incorrectCount).toBe(1);
    expect(state.questions.q1.everCorrect).toBe(true);
  });

  it("tracks lastCorrect as the most recent attempt's outcome", () => {
    let state = emptyProgressState();
    state = recordAttempt(state, "q1", true);
    state = recordAttempt(state, "q1", false);
    expect(state.questions.q1.lastCorrect).toBe(false);
  });

  it("bounds history length", () => {
    let state = emptyProgressState();
    for (let i = 0; i < 30; i++) {
      state = recordAttempt(state, "q1", true);
    }
    expect(state.questions.q1.history.length).toBeLessThanOrEqual(20);
  });
});

describe("streak logic", () => {
  beforeEach(() => vi.useRealTimers());

  it("starts a streak at 1 on the first ever answer", () => {
    const state = recordAttempt(emptyProgressState(), "q1", true);
    expect(state.streak.current).toBe(1);
    expect(state.streak.best).toBe(1);
  });

  it("does not increment the streak twice on the same day", () => {
    let state = emptyProgressState();
    state = recordAttempt(state, "q1", true);
    state = recordAttempt(state, "q2", true);
    expect(state.streak.current).toBe(1);
  });
});

describe("toggleFavorite / toggleDifficult", () => {
  it("toggles favorite on and off", () => {
    let state = emptyProgressState();
    state = toggleFavorite(state, "q1");
    expect(state.questions.q1.favorite).toBe(true);
    state = toggleFavorite(state, "q1");
    expect(state.questions.q1.favorite).toBe(false);
  });

  it("toggles the manual difficult flag independently of auto-difficulty", () => {
    let state = emptyProgressState();
    state = toggleDifficult(state, "q1");
    expect(state.questions.q1.markedDifficult).toBe(true);
  });
});

describe("isAutoDifficult", () => {
  it("requires at least 2 attempts before judging difficulty", () => {
    let state = emptyProgressState();
    state = recordAttempt(state, "q1", false);
    expect(isAutoDifficult(state.questions.q1)).toBe(false);
  });

  it("flags a question with a low success rate as difficult", () => {
    let state = emptyProgressState();
    state = recordAttempt(state, "q1", false);
    state = recordAttempt(state, "q1", false);
    state = recordAttempt(state, "q1", true);
    expect(isAutoDifficult(state.questions.q1)).toBe(true);
  });

  it("does not flag a question with a high success rate", () => {
    let state = emptyProgressState();
    state = recordAttempt(state, "q1", true);
    state = recordAttempt(state, "q1", true);
    state = recordAttempt(state, "q1", false);
    expect(isAutoDifficult(state.questions.q1)).toBe(false);
  });
});
