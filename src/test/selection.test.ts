import { describe, expect, it } from "vitest";
import { emptyProgressState } from "@/types";
import type { Question } from "@/types";
import { filterQuestions, pickForReview, pickRandom, priorityScore, shuffle } from "@/engine/selection";
import { recordAttempt } from "@/engine/progressStore";

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

describe("shuffle", () => {
  it("does not mutate the input array", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input, () => 0.5);
    expect(input).toEqual(copy);
  });

  it("preserves all elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input, Math.random);
    expect(result.sort()).toEqual(input.sort());
  });

  it("is deterministic for a fixed rng", () => {
    const a = shuffle([1, 2, 3, 4], () => 0.1);
    const b = shuffle([1, 2, 3, 4], () => 0.1);
    expect(a).toEqual(b);
  });
});

describe("pickRandom", () => {
  it("never returns more items than requested or available", () => {
    const questions = [makeQuestion({ id: "a" }), makeQuestion({ id: "b" })];
    expect(pickRandom(questions, 5)).toHaveLength(2);
    expect(pickRandom(questions, 1)).toHaveLength(1);
  });
});

describe("filterQuestions", () => {
  const questions = [
    makeQuestion({ id: "a", topic: "fundamentals", level: 1, difficulty: 1, type: "true-false" }),
    makeQuestion({ id: "b", topic: "numpy", level: 5, difficulty: 4, type: "multiple-choice" }),
    makeQuestion({ id: "c", topic: "fundamentals", level: 1, difficulty: 3, type: "text" }),
  ];

  it("filters by topic", () => {
    expect(filterQuestions(questions, { topics: ["numpy"] }).map((q) => q.id)).toEqual(["b"]);
  });

  it("filters by level", () => {
    expect(filterQuestions(questions, { levels: [5] }).map((q) => q.id)).toEqual(["b"]);
  });

  it("filters by difficulty", () => {
    expect(filterQuestions(questions, { difficulties: [3, 4] }).map((q) => q.id).sort()).toEqual(["b", "c"]);
  });

  it("filters by type", () => {
    expect(filterQuestions(questions, { types: ["text"] }).map((q) => q.id)).toEqual(["c"]);
  });

  it("filters by search text against prompt/tags/subtopics", () => {
    const tagged = [makeQuestion({ id: "d", tags: ["closures"], prompt: "about scopes" })];
    expect(filterQuestions(tagged, { search: "closures" })).toHaveLength(1);
    expect(filterQuestions(tagged, { search: "unrelated" })).toHaveLength(0);
  });

  it("combines multiple filters with AND semantics", () => {
    expect(filterQuestions(questions, { topics: ["fundamentals"], difficulties: [3] }).map((q) => q.id)).toEqual([
      "c",
    ]);
  });

  it("returns everything when no filters are set", () => {
    expect(filterQuestions(questions, {})).toHaveLength(3);
  });
});

describe("priorityScore", () => {
  it("gives a baseline score to never-attempted questions", () => {
    const q = makeQuestion({ id: "a" });
    expect(priorityScore(q, emptyProgressState())).toBe(1);
  });

  it("scores a never-correct question higher than a mastered one", () => {
    const q = makeQuestion({ id: "a" });
    let failing = emptyProgressState();
    failing = recordAttempt(failing, "a", false);

    let mastered = emptyProgressState();
    mastered = recordAttempt(mastered, "a", true);

    expect(priorityScore(q, failing)).toBeGreaterThan(priorityScore(q, mastered));
  });
});

describe("pickForReview", () => {
  it("prioritizes never-correct questions over mastered ones", () => {
    const questions = [makeQuestion({ id: "failing" }), makeQuestion({ id: "mastered" })];
    let progress = emptyProgressState();
    progress = recordAttempt(progress, "failing", false);
    progress = recordAttempt(progress, "mastered", true);
    progress = recordAttempt(progress, "mastered", true);

    const picked = pickForReview(questions, progress, 1, () => 0);
    expect(picked[0].id).toBe("failing");
  });
});
