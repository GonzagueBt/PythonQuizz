import type { Difficulty, ProgressState, Question, StreakState, Topic } from "@/types";
import { TOPICS } from "@/types";
import { isAutoDifficult } from "./progressStore";

export interface TopicStat {
  topic: Topic;
  total: number;
  answered: number;
  attempts: number;
  correct: number;
  accuracy: number;
}

export interface DifficultyStat {
  difficulty: Difficulty;
  total: number;
  answered: number;
  attempts: number;
  correct: number;
  accuracy: number;
}

export interface GlobalStats {
  totalQuestions: number;
  answeredQuestions: number;
  totalAttempts: number;
  totalCorrect: number;
  accuracy: number;
  masteredCount: number;
  perTopic: TopicStat[];
  perDifficulty: DifficultyStat[];
  weakTopics: Topic[];
  favoriteIds: string[];
  difficultIds: string[];
  neverCorrectIds: string[];
  recentlyWorkedIds: string[];
  streak: StreakState;
}

const MIN_ATTEMPTS_FOR_WEAK_TOPIC = 3;
const WEAK_TOPIC_THRESHOLD = 0.6;

export function computeStats(questions: Question[], progress: ProgressState): GlobalStats {
  const perTopicMap = new Map<Topic, TopicStat>(
    TOPICS.map((t) => [t, { topic: t, total: 0, answered: 0, attempts: 0, correct: 0, accuracy: 0 }]),
  );
  const perDifficultyMap = new Map<Difficulty, DifficultyStat>(
    ([1, 2, 3, 4, 5] as Difficulty[]).map((d) => [
      d,
      { difficulty: d, total: 0, answered: 0, attempts: 0, correct: 0, accuracy: 0 },
    ]),
  );

  let totalAttempts = 0;
  let totalCorrect = 0;
  let answeredQuestions = 0;
  let masteredCount = 0;
  const favoriteIds: string[] = [];
  const difficultIds: string[] = [];
  const neverCorrectIds: string[] = [];

  for (const q of questions) {
    const p = progress.questions[q.id];
    const topicStat = perTopicMap.get(q.topic)!;
    const diffStat = perDifficultyMap.get(q.difficulty)!;
    topicStat.total += 1;
    diffStat.total += 1;

    if (p && p.attempts > 0) {
      answeredQuestions += 1;
      totalAttempts += p.attempts;
      totalCorrect += p.correctCount;
      topicStat.answered += 1;
      topicStat.attempts += p.attempts;
      topicStat.correct += p.correctCount;
      diffStat.answered += 1;
      diffStat.attempts += p.attempts;
      diffStat.correct += p.correctCount;
      if (p.everCorrect) masteredCount += 1;
      if (!p.everCorrect) neverCorrectIds.push(q.id);
    }
    if (p?.favorite) favoriteIds.push(q.id);
    if (p?.markedDifficult || isAutoDifficult(p)) difficultIds.push(q.id);
  }

  for (const stat of perTopicMap.values()) {
    stat.accuracy = stat.attempts > 0 ? stat.correct / stat.attempts : 0;
  }
  for (const stat of perDifficultyMap.values()) {
    stat.accuracy = stat.attempts > 0 ? stat.correct / stat.attempts : 0;
  }

  const weakTopics = Array.from(perTopicMap.values())
    .filter((s) => s.attempts >= MIN_ATTEMPTS_FOR_WEAK_TOPIC && s.accuracy < WEAK_TOPIC_THRESHOLD)
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((s) => s.topic);

  const recentlyWorkedIds = Object.values(progress.questions)
    .filter((p) => p.attempts > 0)
    .sort((a, b) => b.lastAttemptAt - a.lastAttemptAt)
    .slice(0, 10)
    .map((p) => p.questionId);

  return {
    totalQuestions: questions.length,
    answeredQuestions,
    totalAttempts,
    totalCorrect,
    accuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
    masteredCount,
    perTopic: Array.from(perTopicMap.values()),
    perDifficulty: Array.from(perDifficultyMap.values()),
    weakTopics,
    favoriteIds,
    difficultIds,
    neverCorrectIds,
    recentlyWorkedIds,
    streak: progress.streak,
  };
}
