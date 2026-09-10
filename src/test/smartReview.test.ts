import { describe, expect, it } from "vitest";
import type { Question } from "@/types";
import { emptyProgressState } from "@/types";
import { recordAttempt } from "@/engine/progressStore";
import { suggestRevisions } from "@/engine/smartReview";

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

describe("suggestRevisions", () => {
  it("suggests nothing without enough attempts", () => {
    const questions = [makeQuestion({ id: "a", tags: ["closures"] })];
    let progress = emptyProgressState();
    progress = recordAttempt(progress, "a", false);
    expect(suggestRevisions(questions, progress)).toEqual([]);
  });

  it("surfaces a tag with a low success rate once enough attempts exist", () => {
    const questions = [makeQuestion({ id: "a", tags: ["closures"] })];
    let progress = emptyProgressState();
    progress = recordAttempt(progress, "a", false);
    progress = recordAttempt(progress, "a", false);
    progress = recordAttempt(progress, "a", false);

    const suggestions = suggestRevisions(questions, progress);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].tag).toBe("closures");
    expect(suggestions[0].questionIds).toContain("a");
  });

  it("ranks the weakest tag first", () => {
    const questions = [
      makeQuestion({ id: "a", tags: ["weak"] }),
      makeQuestion({ id: "b", tags: ["strong"] }),
    ];
    let progress = emptyProgressState();
    progress = recordAttempt(progress, "a", false);
    progress = recordAttempt(progress, "a", false);
    progress = recordAttempt(progress, "a", false);
    progress = recordAttempt(progress, "b", true);
    progress = recordAttempt(progress, "b", true);
    progress = recordAttempt(progress, "b", true);

    const suggestions = suggestRevisions(questions, progress);
    expect(suggestions[0].tag).toBe("weak");
  });
});
