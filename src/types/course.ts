import type { Level, Topic } from "./question";

export interface CourseSection {
  id: string;
  level: Level;
  topic: Topic;
  title: string;
  /** One-sentence teaser shown in lists. */
  summary: string;
  /** Markdown body (headings, lists, inline code, fenced code blocks). */
  content: string;
  order: number;
}
