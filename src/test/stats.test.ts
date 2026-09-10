import { describe, expect, it } from "vitest";
import type { Question } from "@/types";
import { emptyProgressState } from "@/types";
import { recordAttempt, toggleFavorite } from "@/engine/progressStore";
import { computeStats } from "@/engine/stats";

function makeQuestion(overrides: Partial<Question> & { id: string }): Question {
  return {
    type: "true-false",
    kind: "knowledge",
    level: 1,
    topic: "fundamentals",
    subtopics: [],
    difficulty: 1,
    cognitiveLevel: "decouverte",
    tags: [],
    prompt: "prompt",
    hints: [],
    explanation: "explanation",
    correct: true,
    ...overrides,
  } as Question;
}

describe("computeStats", () => {
  const questions = [
    makeQuestion({ id: "a", topic: "fundamentals", difficulty: 1 }),
    makeQuestion({ id: "b", topic: "numpy", difficulty: 4 }),
  ];

  it("reports zeroed stats for an empty progress state", () => {
    const stats = computeStats(questions, emptyProgressState());
    expect(stats.totalQuestions).toBe(2);
    expect(stats.answeredQuestions).toBe(0);
    expect(stats.accuracy).toBe(0);
  });

  it("computes global accuracy from attempts, not from unique questions", () => {
    let progress = emptyProgressState();
    progress = recordAttempt(progress, "a", true);
    progress = recordAttempt(progress, "a", false);
    const stats = computeStats(questions, progress);
    expect(stats.totalAttempts).toBe(2);
    expect(stats.totalCorrect).toBe(1);
    expect(stats.accuracy).toBe(0.5);
  });

  it("buckets accuracy per topic independently", () => {
    let progress = emptyProgressState();
    progress = recordAttempt(progress, "a", true);
    progress = recordAttempt(progress, "b", false);
    const stats = computeStats(questions, progress);
    const fundamentals = stats.perTopic.find((t) => t.topic === "fundamentals")!;
    const numpy = stats.perTopic.find((t) => t.topic === "numpy")!;
    expect(fundamentals.accuracy).toBe(1);
    expect(numpy.accuracy).toBe(0);
  });

  it("lists favorites", () => {
    let progress = emptyProgressState();
    progress = toggleFavorite(progress, "a");
    const stats = computeStats(questions, progress);
    expect(stats.favoriteIds).toEqual(["a"]);
  });

  it("lists never-correct questions only among attempted ones", () => {
    let progress = emptyProgressState();
    progress = recordAttempt(progress, "a", false);
    const stats = computeStats(questions, progress);
    expect(stats.neverCorrectIds).toEqual(["a"]);
    expect(stats.neverCorrectIds).not.toContain("b");
  });
});
