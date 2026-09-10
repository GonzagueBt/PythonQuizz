import { describe, expect, it } from "vitest";
import type {
  CodeEditorQuestion,
  FillCodeQuestion,
  MatchingQuestion,
  MultipleChoiceQuestion,
  OrderingQuestion,
  Question,
  TextQuestion,
  TrueFalseQuestion,
} from "@/types";
import { createInitialDraft, draftToAnswer, isDraftReady } from "@/engine/draft";
import { checkAnswer } from "@/engine/validation";

const base = {
  id: "q1",
  level: 1 as const,
  topic: "fundamentals" as const,
  subtopics: [],
  difficulty: 1 as const,
  cognitiveLevel: "decouverte" as const,
  tags: [],
  prompt: "test",
  hints: [],
  explanation: "test",
  kind: "knowledge" as const,
};

describe("createInitialDraft / isDraftReady", () => {
  it("multiple-choice starts empty and not ready", () => {
    const q: MultipleChoiceQuestion = {
      ...base,
      type: "multiple-choice",
      options: [{ id: "a", text: "A", correct: true }],
    };
    const draft = createInitialDraft(q);
    expect(isDraftReady(q, draft)).toBe(false);
  });

  it("true-false is not ready until a value is chosen", () => {
    const q: TrueFalseQuestion = { ...base, type: "true-false", correct: true };
    const draft = createInitialDraft(q);
    expect(isDraftReady(q, draft)).toBe(false);
  });

  it("text/code-output require non-empty trimmed input", () => {
    const q: TextQuestion = { ...base, type: "text", acceptedAnswers: ["x"] };
    expect(isDraftReady(q, { type: "text", value: "  " })).toBe(false);
    expect(isDraftReady(q, { type: "text", value: "x" })).toBe(true);
  });

  it("fill-code requires every blank filled", () => {
    const q: FillCodeQuestion = {
      ...base,
      type: "fill-code",
      codeTemplate: "{{blank:a}} {{blank:b}}",
      blanks: [
        { id: "a", acceptedAnswers: ["1"] },
        { id: "b", acceptedAnswers: ["2"] },
      ],
    };
    expect(isDraftReady(q, { type: "fill-code", values: { a: "1" } })).toBe(false);
    expect(isDraftReady(q, { type: "fill-code", values: { a: "1", b: "2" } })).toBe(true);
  });

  it("matching requires every pair assigned", () => {
    const q: MatchingQuestion = {
      ...base,
      type: "matching",
      pairs: [
        { id: "p1", left: "a", right: "b" },
        { id: "p2", left: "c", right: "d" },
      ],
    };
    expect(isDraftReady(q, { type: "matching", selection: { p1: "p1" } })).toBe(false);
    expect(isDraftReady(q, { type: "matching", selection: { p1: "p1", p2: "p2" } })).toBe(true);
  });

  it("ordering starts as a shuffled permutation of all item ids, already ready", () => {
    const q: OrderingQuestion = {
      ...base,
      type: "ordering",
      items: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      correctOrder: ["a", "b"],
    };
    const draft = createInitialDraft(q, () => 0.9);
    expect(draft.type).toBe("ordering");
    if (draft.type === "ordering") {
      expect(draft.order.sort()).toEqual(["a", "b"]);
    }
    expect(isDraftReady(q, draft)).toBe(true);
  });

  it("code-editor is not ready until a test run has produced a result", () => {
    const q: CodeEditorQuestion = {
      ...base,
      type: "code-editor",
      starterCode: "pass",
      solution: "pass",
      testCases: [],
    };
    const draft = createInitialDraft(q);
    expect(isDraftReady(q, draft)).toBe(false);
    expect(isDraftReady(q, { type: "code-editor", code: "pass", passedAll: false })).toBe(true);
  });
});

describe("draftToAnswer", () => {
  it("round-trips into a valid Answer usable by checkAnswer", () => {
    const q: TrueFalseQuestion = { ...base, type: "true-false", correct: true };
    const draft = { type: "true-false" as const, value: true };
    const answer = draftToAnswer(draft);
    expect(checkAnswer(q, answer).correct).toBe(true);
  });

  it("throws for an unresolved true-false draft", () => {
    expect(() => draftToAnswer({ type: "true-false", value: undefined })).toThrow();
  });
});

// Sanity: every question type must be handled without falling through.
describe("createInitialDraft exhaustiveness", () => {
  const types: Question["type"][] = [
    "multiple-choice",
    "true-false",
    "text",
    "code-output",
    "code-editor",
    "fill-code",
    "matching",
    "ordering",
  ];
  it.each(types)("does not throw for %s", (type) => {
    expect(() => {
      const q = buildMinimal(type);
      createInitialDraft(q);
    }).not.toThrow();
  });
});

function buildMinimal(type: Question["type"]): Question {
  switch (type) {
    case "multiple-choice":
      return { ...base, type, options: [{ id: "a", text: "A", correct: true }] };
    case "true-false":
      return { ...base, type, correct: true };
    case "text":
      return { ...base, type, acceptedAnswers: ["x"] };
    case "code-output":
      return { ...base, type, code: "print(1)", expectedOutput: "1" };
    case "code-editor":
      return { ...base, type, starterCode: "", solution: "", testCases: [] };
    case "fill-code":
      return { ...base, type, codeTemplate: "{{blank:a}}", blanks: [{ id: "a", acceptedAnswers: ["1"] }] };
    case "matching":
      return { ...base, type, pairs: [{ id: "p1", left: "a", right: "b" }] };
    case "ordering":
      return { ...base, type, items: [{ id: "a", label: "A" }], correctOrder: ["a"] };
  }
}
