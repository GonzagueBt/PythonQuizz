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
import { isOutputCorrect, isTextAnswerCorrect } from "@/utils/textCompare";

export type Answer =
  | { type: "multiple-choice"; selectedOptionIds: string[] }
  | { type: "true-false"; value: boolean }
  | { type: "text"; value: string }
  | { type: "code-output"; value: string }
  | { type: "fill-code"; values: Record<string, string> }
  /** Maps each pair id (left item) to the pair id of the right item the user chose. */
  | { type: "matching"; selection: Record<string, string> }
  | { type: "ordering"; order: string[] }
  /** Filled in once Pyodide has run the test cases. */
  | { type: "code-editor"; code: string; passedAll: boolean };

export interface OptionFeedback {
  optionId: string;
  wasSelected: boolean;
  isCorrect: boolean;
  whyWrong?: string;
}

export interface ValidationResult {
  correct: boolean;
  /** Per-option feedback, only present for multiple-choice questions. */
  optionFeedback?: OptionFeedback[];
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((x) => setB.has(x));
}

function validateMultipleChoice(
  question: MultipleChoiceQuestion,
  answer: Extract<Answer, { type: "multiple-choice" }>,
): ValidationResult {
  const correctIds = question.options.filter((o) => o.correct).map((o) => o.id);
  const correct = sameSet(answer.selectedOptionIds, correctIds);
  const optionFeedback: OptionFeedback[] = question.options.map((o) => ({
    optionId: o.id,
    wasSelected: answer.selectedOptionIds.includes(o.id),
    isCorrect: o.correct,
    whyWrong: o.whyWrong,
  }));
  return { correct, optionFeedback };
}

function validateTrueFalse(
  question: TrueFalseQuestion,
  answer: Extract<Answer, { type: "true-false" }>,
): ValidationResult {
  return { correct: answer.value === question.correct };
}

function validateText(
  question: TextQuestion,
  answer: Extract<Answer, { type: "text" }>,
): ValidationResult {
  return {
    correct: isTextAnswerCorrect(
      answer.value,
      question.acceptedAnswers,
      question.caseSensitive ?? false,
    ),
  };
}

function validateCodeOutput(
  question: { expectedOutput: string },
  answer: Extract<Answer, { type: "code-output" }>,
): ValidationResult {
  return { correct: isOutputCorrect(answer.value, question.expectedOutput) };
}

function validateFillCode(
  question: FillCodeQuestion,
  answer: Extract<Answer, { type: "fill-code" }>,
): ValidationResult {
  const correct = question.blanks.every((blank) =>
    isTextAnswerCorrect(
      answer.values[blank.id] ?? "",
      blank.acceptedAnswers,
      blank.caseSensitive ?? false,
    ),
  );
  return { correct };
}

function validateMatching(
  question: MatchingQuestion,
  answer: Extract<Answer, { type: "matching" }>,
): ValidationResult {
  const correct = question.pairs.every((pair) => answer.selection[pair.id] === pair.id);
  return { correct };
}

function validateOrdering(
  question: OrderingQuestion,
  answer: Extract<Answer, { type: "ordering" }>,
): ValidationResult {
  const correct =
    answer.order.length === question.correctOrder.length &&
    answer.order.every((id, i) => id === question.correctOrder[i]);
  return { correct };
}

function validateCodeEditor(
  _question: CodeEditorQuestion,
  answer: Extract<Answer, { type: "code-editor" }>,
): ValidationResult {
  return { correct: answer.passedAll };
}

/**
 * Single entry point used by the UI: validates a user's answer against a
 * question, regardless of its type. Throws if the answer's type does not
 * match the question's type (a programming error, not a user error).
 */
export function checkAnswer(question: Question, answer: Answer): ValidationResult {
  if (question.type !== answer.type) {
    throw new Error(
      `Answer type "${answer.type}" does not match question type "${question.type}"`,
    );
  }
  switch (question.type) {
    case "multiple-choice":
      return validateMultipleChoice(question, answer as Extract<Answer, { type: "multiple-choice" }>);
    case "true-false":
      return validateTrueFalse(question, answer as Extract<Answer, { type: "true-false" }>);
    case "text":
      return validateText(question, answer as Extract<Answer, { type: "text" }>);
    case "code-output":
      return validateCodeOutput(question, answer as Extract<Answer, { type: "code-output" }>);
    case "fill-code":
      return validateFillCode(question, answer as Extract<Answer, { type: "fill-code" }>);
    case "matching":
      return validateMatching(question, answer as Extract<Answer, { type: "matching" }>);
    case "ordering":
      return validateOrdering(question, answer as Extract<Answer, { type: "ordering" }>);
    case "code-editor":
      return validateCodeEditor(question, answer as Extract<Answer, { type: "code-editor" }>);
  }
}
