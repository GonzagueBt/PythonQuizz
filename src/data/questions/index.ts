import type { Question } from "@/types";
import { fundamentalsQuestions } from "./fundamentals";
import { intermediateQuestions } from "./intermediate";
import { advancedQuestions } from "./advanced";
import { internalsQuestions } from "./internals";
import { performanceQuestions } from "./performance";
import { concurrencyQuestions } from "./concurrency";
import { stdlibQuestions } from "./stdlib";
import { numpyQuestions } from "./numpy";
import { pandasQuestions } from "./pandas";
import { sqlQuestions } from "./sql";
import { professionalQuestions } from "./professional";
import { gotchasQuestions } from "./gotchas";

export const allQuestions: Question[] = [
  ...fundamentalsQuestions,
  ...intermediateQuestions,
  ...advancedQuestions,
  ...internalsQuestions,
  ...performanceQuestions,
  ...concurrencyQuestions,
  ...stdlibQuestions,
  ...numpyQuestions,
  ...pandasQuestions,
  ...sqlQuestions,
  ...professionalQuestions,
  ...gotchasQuestions,
];

export const questionById = new Map(allQuestions.map((q) => [q.id, q]));

if (import.meta.env.DEV) {
  const ids = new Set<string>();
  for (const q of allQuestions) {
    if (ids.has(q.id)) {
      console.error(`Duplicate question id detected: ${q.id}`);
    }
    ids.add(q.id);
  }
}
