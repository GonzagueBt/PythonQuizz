import type { FillCodeQuestion, MatchingQuestion, Question } from "@/types";
import type { Answer } from "./validation";
import { shuffle } from "./selection";

/**
 * A "draft" mirrors `Answer` but represents in-progress, possibly incomplete
 * UI state (e.g. no option selected yet). It becomes an `Answer` only once
 * `isDraftReady` says it's safe to validate.
 */
export type Draft =
  | { type: "multiple-choice"; selectedOptionIds: string[] }
  | { type: "true-false"; value?: boolean }
  | { type: "text"; value: string }
  | { type: "code-output"; value: string }
  | { type: "fill-code"; values: Record<string, string> }
  | { type: "matching"; selection: Record<string, string> }
  | { type: "ordering"; order: string[] }
  | { type: "code-editor"; code: string; passedAll?: boolean };

export function createInitialDraft(question: Question, rng: () => number = Math.random): Draft {
  switch (question.type) {
    case "multiple-choice":
      return { type: "multiple-choice", selectedOptionIds: [] };
    case "true-false":
      return { type: "true-false", value: undefined };
    case "text":
      return { type: "text", value: "" };
    case "code-output":
      return { type: "code-output", value: "" };
    case "fill-code":
      return { type: "fill-code", values: {} };
    case "matching":
      return { type: "matching", selection: {} };
    case "ordering":
      return { type: "ordering", order: shuffle(question.items.map((i) => i.id), rng) };
    case "code-editor":
      return { type: "code-editor", code: question.starterCode, passedAll: undefined };
  }
}

export function isDraftReady(question: Question, draft: Draft): boolean {
  switch (draft.type) {
    case "multiple-choice":
      return draft.selectedOptionIds.length > 0;
    case "true-false":
      return draft.value !== undefined;
    case "text":
      return draft.value.trim().length > 0;
    case "code-output":
      return draft.value.trim().length > 0;
    case "fill-code":
      return (question as FillCodeQuestion).blanks.every(
        (b) => (draft.values[b.id] ?? "").trim().length > 0,
      );
    case "matching":
      return (question as MatchingQuestion).pairs.every((p) => Boolean(draft.selection[p.id]));
    case "ordering":
      return draft.order.length > 0;
    case "code-editor":
      return draft.passedAll !== undefined;
  }
}

/** Converts a ready draft into an Answer for `checkAnswer`. Only call once `isDraftReady` is true. */
export function draftToAnswer(draft: Draft): Answer {
  if (draft.type === "true-false" && draft.value === undefined) {
    throw new Error("Draft not ready: true-false value is undefined");
  }
  return draft as Answer;
}
