import { describe, expect, it } from "vitest";
import { allQuestions } from "@/data/questions";
import { allCourses, courseById } from "@/data/courses";

describe("question bank integrity", () => {
  it("has a substantial bank of questions", () => {
    expect(allQuestions.length).toBeGreaterThan(150);
  });

  it("has no duplicate question ids", () => {
    const ids = allQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references only existing course ids", () => {
    const dangling = allQuestions.filter((q) => q.courseId && !courseById.has(q.courseId));
    expect(dangling.map((q) => q.id)).toEqual([]);
  });

  it("gives every multiple-choice question at least one correct option", () => {
    const broken = allQuestions.filter(
      (q) => q.type === "multiple-choice" && !q.options.some((o) => o.correct),
    );
    expect(broken.map((q) => q.id)).toEqual([]);
  });

  it("keeps single-answer multiple-choice questions to exactly one correct option", () => {
    const broken = allQuestions.filter(
      (q) => q.type === "multiple-choice" && !q.multiple && q.options.filter((o) => o.correct).length !== 1,
    );
    expect(broken.map((q) => q.id)).toEqual([]);
  });

  it("gives every question at least one hint and a non-empty explanation", () => {
    const broken = allQuestions.filter((q) => q.hints.length === 0 || q.explanation.trim().length === 0);
    expect(broken.map((q) => q.id)).toEqual([]);
  });

  it("keeps ordering questions' correctOrder consistent with their items", () => {
    const broken = allQuestions.filter((q) => {
      if (q.type !== "ordering") return false;
      const itemIds = new Set(q.items.map((i) => i.id));
      return (
        q.correctOrder.length !== q.items.length || !q.correctOrder.every((id) => itemIds.has(id))
      );
    });
    expect(broken.map((q) => q.id)).toEqual([]);
  });

  it("keeps fill-code blanks referenced in the template", () => {
    const broken = allQuestions.filter((q) => {
      if (q.type !== "fill-code") return false;
      return !q.blanks.every((b) => q.codeTemplate.includes(`{{blank:${b.id}}}`));
    });
    expect(broken.map((q) => q.id)).toEqual([]);
  });

  it("gives every code-editor question at least one test case and a solution", () => {
    const broken = allQuestions.filter(
      (q) => q.type === "code-editor" && (q.testCases.length === 0 || q.solution.trim().length === 0),
    );
    expect(broken.map((q) => q.id)).toEqual([]);
  });

  it("covers all 12 topics with at least a few questions each", () => {
    const byTopic = new Map<string, number>();
    for (const q of allQuestions) byTopic.set(q.topic, (byTopic.get(q.topic) ?? 0) + 1);
    for (const [topic, count] of byTopic) {
      expect(count, `topic ${topic} has too few questions`).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("course content integrity", () => {
  it("has no duplicate course ids", () => {
    const ids = allCourses.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every course non-empty content", () => {
    const broken = allCourses.filter((c) => c.content.trim().length < 50);
    expect(broken.map((c) => c.id)).toEqual([]);
  });
});
