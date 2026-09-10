/**
 * Core data model for the question bank.
 *
 * Every question is a self-contained object: it can be rendered, validated,
 * and explained without any other context than its own fields (plus an
 * optional linked course for the "besoin d'aide" panel).
 */

export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type CognitiveLevel =
  | "decouverte"
  | "comprehension"
  | "application"
  | "analyse"
  | "piege"
  | "expertise";

/** Where a described behavior actually comes from — important for accuracy. */
export type BehaviorSource =
  /** Guaranteed by the Python language specification. */
  | "language"
  /** An implementation detail of CPython, not guaranteed by other implementations. */
  | "cpython"
  /** Differs across supported Python versions. */
  | "version-dependent";

export const TOPICS = [
  "fundamentals",
  "intermediate",
  "advanced",
  "internals",
  "performance",
  "concurrency",
  "stdlib",
  "numpy",
  "pandas",
  "sql",
  "professional",
  "gotchas",
] as const;

export type Topic = (typeof TOPICS)[number];

export type QuestionType =
  | "multiple-choice"
  | "true-false"
  | "text"
  | "code-output"
  | "code-editor"
  | "fill-code"
  | "matching"
  | "ordering";

/**
 * A finer-grained label than QuestionType, used for filtering/analytics and
 * to pick sensible micro-copy in the UI (e.g. "Trouve l'erreur" vs "QCM").
 * It does not change how the question is validated — that's driven by `type`.
 */
export type QuestionKind =
  | "knowledge"
  | "prediction"
  | "code-analysis"
  | "find-error"
  | "fix-code"
  | "write-code"
  | "documentation"
  | "realistic"
  | "gotcha";

interface QuestionCommon {
  id: string;
  type: QuestionType;
  kind: QuestionKind;
  level: Level;
  topic: Topic;
  subtopics: string[];
  difficulty: Difficulty;
  cognitiveLevel: CognitiveLevel;
  tags: string[];
  /** Main question text. Supports simple markdown (bold, inline code). */
  prompt: string;
  /** Optional Python snippet shown above the prompt. */
  code?: string;
  /** Id of a CourseSection used by the "Besoin d'aide ?" panel. */
  courseId?: string;
  /** Progressive hints: hint[0] is the vaguest, last one is almost the answer. */
  hints: string[];
  /** Full pedagogical explanation shown after the user answers. */
  explanation: string;
  /** Set when the correct behavior depends on the Python version. */
  pythonVersionNote?: string;
  /** Set when relevant: clarifies language guarantee vs CPython detail. */
  source?: BehaviorSource;
}

export interface ChoiceOption {
  id: string;
  text: string;
  correct: boolean;
  /** Explains why this specific (wrong) option is incorrect. */
  whyWrong?: string;
}

export interface MultipleChoiceQuestion extends QuestionCommon {
  type: "multiple-choice";
  options: ChoiceOption[];
  /** When true, more than one option may be correct (checkboxes, not radio). */
  multiple?: boolean;
}

export interface TrueFalseQuestion extends QuestionCommon {
  type: "true-false";
  correct: boolean;
}

export interface TextQuestion extends QuestionCommon {
  type: "text";
  /** Any of these (after normalization) is accepted. */
  acceptedAnswers: string[];
  caseSensitive?: boolean;
}

export interface CodeOutputQuestion extends QuestionCommon {
  type: "code-output";
  code: string;
  expectedOutput: string;
}

export interface FillCodeBlank {
  id: string;
  acceptedAnswers: string[];
  caseSensitive?: boolean;
}

export interface FillCodeQuestion extends QuestionCommon {
  type: "fill-code";
  /** Template with blanks marked as `{{blank:id}}`. */
  codeTemplate: string;
  blanks: FillCodeBlank[];
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingQuestion extends QuestionCommon {
  type: "matching";
  pairs: MatchingPair[];
}

export interface OrderingItem {
  id: string;
  label: string;
}

export interface OrderingQuestion extends QuestionCommon {
  type: "ordering";
  items: OrderingItem[];
  /** Correct sequence of item ids, from first to last. */
  correctOrder: string[];
}

export interface CodeEditorTestCase {
  /** A Python expression evaluated against the user's namespace, e.g. "is_even(4)". */
  call: string;
  /** Expected value, compared with Python `==` after repr-safe JSON coercion. */
  expected: unknown;
  description: string;
}

export interface CodeEditorQuestion extends QuestionCommon {
  type: "code-editor";
  starterCode: string;
  testCases: CodeEditorTestCase[];
  /** Reference solution, revealed after validation or on demand. */
  solution: string;
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | TextQuestion
  | CodeOutputQuestion
  | FillCodeQuestion
  | MatchingQuestion
  | OrderingQuestion
  | CodeEditorQuestion;

export const LEVEL_LABELS: Record<Level, string> = {
  1: "Python Fundamentals",
  2: "Python Intermediate",
  3: "Python Advanced",
  4: "Python Internals",
  5: "Performance",
  6: "Parallelism & Concurrency",
};

export const TOPIC_LABELS: Record<Topic, string> = {
  fundamentals: "Fondamentaux",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
  internals: "Internals CPython",
  performance: "Performance",
  concurrency: "Concurrence & parallélisme",
  stdlib: "Bibliothèque standard",
  numpy: "NumPy",
  pandas: "Pandas",
  sql: "SQL / sqlite3",
  professional: "Python professionnel",
  gotchas: "Python Gotchas",
};

export const DIFFICULTY_STARS: Record<Difficulty, string> = {
  1: "★☆☆☆☆",
  2: "★★☆☆☆",
  3: "★★★☆☆",
  4: "★★★★☆",
  5: "★★★★★",
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  "multiple-choice": "QCM",
  "true-false": "Vrai / Faux",
  text: "Réponse textuelle",
  "code-output": "Prédiction de sortie",
  "code-editor": "Écrire du code",
  "fill-code": "Compléter le code",
  matching: "Associer",
  ordering: "Classer",
};
