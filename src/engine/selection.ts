import type { Difficulty, Level, ProgressState, Question, QuestionType, Topic } from "@/types";
import { isAutoDifficult } from "./progressStore";

export interface QuestionFilters {
  levels?: Level[];
  topics?: Topic[];
  difficulties?: Difficulty[];
  types?: QuestionType[];
  search?: string;
  /** Only questions never answered correctly (or never attempted). */
  excludeMastered?: boolean;
}

export function filterQuestions(questions: Question[], filters: QuestionFilters): Question[] {
  const search = filters.search?.trim().toLowerCase();
  return questions.filter((q) => {
    if (filters.levels && filters.levels.length > 0 && !filters.levels.includes(q.level)) {
      return false;
    }
    if (filters.topics && filters.topics.length > 0 && !filters.topics.includes(q.topic)) {
      return false;
    }
    if (
      filters.difficulties &&
      filters.difficulties.length > 0 &&
      !filters.difficulties.includes(q.difficulty)
    ) {
      return false;
    }
    if (filters.types && filters.types.length > 0 && !filters.types.includes(q.type)) {
      return false;
    }
    if (search) {
      const haystack = `${q.prompt} ${q.tags.join(" ")} ${q.subtopics.join(" ")}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

/** Deterministic-signature Fisher-Yates shuffle; does not mutate the input. */
export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickRandom(questions: Question[], count: number, rng: () => number = Math.random): Question[] {
  return shuffle(questions, rng).slice(0, Math.min(count, questions.length));
}

/**
 * Higher score = more urgent to revise. Used to power "quick review",
 * "weak topics" and general spaced-repetition-ish ordering, without needing
 * a full SRS scheduler.
 */
export function priorityScore(question: Question, progress: ProgressState): number {
  const p = progress.questions[question.id];
  if (!p || p.attempts === 0) return 1;

  let score = 0;
  if (!p.everCorrect) score += 5;
  if (p.lastCorrect === false) score += 2;
  if (p.markedDifficult || isAutoDifficult(p)) score += 3;
  if (p.favorite) score += 1;

  const daysSinceSeen = (Date.now() - p.lastAttemptAt) / 86_400_000;
  score += Math.min(3, daysSinceSeen / 3);

  return score;
}

export function pickForReview(
  questions: Question[],
  progress: ProgressState,
  count: number,
  rng: () => number = Math.random,
): Question[] {
  const jittered = questions
    .map((q) => ({ q, score: priorityScore(q, progress) + rng() * 0.75 }))
    .sort((a, b) => b.score - a.score);
  return jittered.slice(0, Math.min(count, jittered.length)).map((x) => x.q);
}
