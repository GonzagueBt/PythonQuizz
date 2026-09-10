import type { ProgressState, Question } from "@/types";

export interface RevisionSuggestion {
  tag: string;
  attempts: number;
  accuracy: number;
  questionIds: string[];
}

const MIN_ATTEMPTS_FOR_SUGGESTION = 3;
const MAX_SUGGESTIONS = 3;
const MAX_QUESTIONS_PER_SUGGESTION = 8;

/**
 * Analyzes local history to answer "What should I revise?": groups attempts
 * by tag/subtopic, finds the weakest ones with enough data to be meaningful,
 * and attaches concrete questions to practice next.
 */
export function suggestRevisions(
  questions: Question[],
  progress: ProgressState,
): RevisionSuggestion[] {
  const byTag = new Map<string, { attempts: number; correct: number; questionIds: Set<string> }>();

  for (const q of questions) {
    const p = progress.questions[q.id];
    if (!p || p.attempts === 0) continue;
    const labels = [...q.tags, ...q.subtopics];
    for (const label of labels) {
      const entry = byTag.get(label) ?? { attempts: 0, correct: 0, questionIds: new Set() };
      entry.attempts += p.attempts;
      entry.correct += p.correctCount;
      if (!p.everCorrect) entry.questionIds.add(q.id);
      byTag.set(label, entry);
    }
  }

  const candidates = Array.from(byTag.entries())
    .map(([tag, entry]) => ({
      tag,
      attempts: entry.attempts,
      accuracy: entry.attempts > 0 ? entry.correct / entry.attempts : 0,
      questionIds: Array.from(entry.questionIds),
    }))
    .filter((c) => c.attempts >= MIN_ATTEMPTS_FOR_SUGGESTION);

  candidates.sort((a, b) => a.accuracy - b.accuracy);

  return candidates.slice(0, MAX_SUGGESTIONS).map((c) => {
    let ids = c.questionIds;
    if (ids.length === 0) {
      // Everything with this tag was eventually solved: suggest a light refresher.
      ids = questions.filter((q) => q.tags.includes(c.tag) || q.subtopics.includes(c.tag)).map((q) => q.id);
    }
    return { ...c, questionIds: ids.slice(0, MAX_QUESTIONS_PER_SUGGESTION) };
  });
}
