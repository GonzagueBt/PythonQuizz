import { describe, expect, it } from "vitest";
import { checkAnswer } from "@/engine/validation";
import type {
  CodeEditorQuestion,
  FillCodeQuestion,
  MatchingQuestion,
  MultipleChoiceQuestion,
  OrderingQuestion,
  TextQuestion,
  TrueFalseQuestion,
} from "@/types";

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

describe("checkAnswer — multiple-choice", () => {
  const question: MultipleChoiceQuestion = {
    ...base,
    type: "multiple-choice",
    options: [
      { id: "a", text: "A", correct: false },
      { id: "b", text: "B", correct: true },
    ],
  };

  it("is correct when the right single option is selected", () => {
    const result = checkAnswer(question, { type: "multiple-choice", selectedOptionIds: ["b"] });
    expect(result.correct).toBe(true);
  });

  it("is incorrect when the wrong option is selected", () => {
    const result = checkAnswer(question, { type: "multiple-choice", selectedOptionIds: ["a"] });
    expect(result.correct).toBe(false);
  });

  it("requires exactly the correct set for multi-select questions", () => {
    const multi: MultipleChoiceQuestion = {
      ...question,
      multiple: true,
      options: [
        { id: "a", text: "A", correct: true },
        { id: "b", text: "B", correct: true },
        { id: "c", text: "C", correct: false },
      ],
    };
    expect(checkAnswer(multi, { type: "multiple-choice", selectedOptionIds: ["a", "b"] }).correct).toBe(true);
    expect(checkAnswer(multi, { type: "multiple-choice", selectedOptionIds: ["a"] }).correct).toBe(false);
    expect(checkAnswer(multi, { type: "multiple-choice", selectedOptionIds: ["a", "b", "c"] }).correct).toBe(false);
  });

  it("provides per-option feedback", () => {
    const result = checkAnswer(question, { type: "multiple-choice", selectedOptionIds: ["a"] });
    expect(result.optionFeedback).toHaveLength(2);
    expect(result.optionFeedback?.find((f) => f.optionId === "b")?.isCorrect).toBe(true);
  });
});

describe("checkAnswer — true-false", () => {
  const question: TrueFalseQuestion = { ...base, type: "true-false", correct: true };
  it("matches the expected boolean", () => {
    expect(checkAnswer(question, { type: "true-false", value: true }).correct).toBe(true);
    expect(checkAnswer(question, { type: "true-false", value: false }).correct).toBe(false);
  });
});

describe("checkAnswer — text", () => {
  const question: TextQuestion = { ...base, type: "text", acceptedAnswers: ["append", "add"] };
  it("accepts any normalized match", () => {
    expect(checkAnswer(question, { type: "text", value: "APPEND" }).correct).toBe(true);
    expect(checkAnswer(question, { type: "text", value: "insert" }).correct).toBe(false);
  });
});

describe("checkAnswer — code-output", () => {
  it("ignores insignificant whitespace", () => {
    const question = { ...base, type: "code-output" as const, code: "print(1)", expectedOutput: "1\n" };
    expect(checkAnswer(question, { type: "code-output", value: "1" }).correct).toBe(true);
    expect(checkAnswer(question, { type: "code-output", value: "2" }).correct).toBe(false);
  });
});

describe("checkAnswer — fill-code", () => {
  const question: FillCodeQuestion = {
    ...base,
    type: "fill-code",
    codeTemplate: "x = {{blank:a}}",
    blanks: [{ id: "a", acceptedAnswers: ["1", "one"] }],
  };
  it("validates every blank against its accepted answers", () => {
    expect(checkAnswer(question, { type: "fill-code", values: { a: "1" } }).correct).toBe(true);
    expect(checkAnswer(question, { type: "fill-code", values: { a: "2" } }).correct).toBe(false);
    expect(checkAnswer(question, { type: "fill-code", values: {} }).correct).toBe(false);
  });
});

describe("checkAnswer — matching", () => {
  const question: MatchingQuestion = {
    ...base,
    type: "matching",
    pairs: [
      { id: "p1", left: "list", right: "mutable" },
      { id: "p2", left: "tuple", right: "immutable" },
    ],
  };
  it("requires every pair mapped to itself", () => {
    expect(
      checkAnswer(question, { type: "matching", selection: { p1: "p1", p2: "p2" } }).correct,
    ).toBe(true);
    expect(
      checkAnswer(question, { type: "matching", selection: { p1: "p2", p2: "p1" } }).correct,
    ).toBe(false);
  });
});

describe("checkAnswer — ordering", () => {
  const question: OrderingQuestion = {
    ...base,
    type: "ordering",
    items: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      { id: "c", label: "C" },
    ],
    correctOrder: ["a", "b", "c"],
  };
  it("requires the exact sequence", () => {
    expect(checkAnswer(question, { type: "ordering", order: ["a", "b", "c"] }).correct).toBe(true);
    expect(checkAnswer(question, { type: "ordering", order: ["b", "a", "c"] }).correct).toBe(false);
  });
});

describe("checkAnswer — code-editor", () => {
  const question: CodeEditorQuestion = {
    ...base,
    type: "code-editor",
    starterCode: "",
    solution: "",
    testCases: [],
  };
  it("delegates correctness to the passedAll flag from the test run", () => {
    expect(checkAnswer(question, { type: "code-editor", code: "x", passedAll: true }).correct).toBe(true);
    expect(checkAnswer(question, { type: "code-editor", code: "x", passedAll: false }).correct).toBe(false);
  });
});

describe("checkAnswer — mismatched types", () => {
  it("throws when the answer type does not match the question type", () => {
    const question: TrueFalseQuestion = { ...base, type: "true-false", correct: true };
    expect(() => checkAnswer(question, { type: "text", value: "x" })).toThrow();
  });
});
