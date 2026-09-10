import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { courseById } from "@/data/courses";
import { CodeBlock } from "@/components/ui/CodeBlock";

function MarkdownCode({ className, children }: { className?: string; children?: ReactNode }) {
  const match = /language-(\w+)/.exec(className ?? "");
  if (match) {
    return <CodeBlock code={String(children).replace(/\n$/, "")} language={match[1]} />;
  }
  return (
    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-brand-700 dark:bg-slate-800 dark:text-brand-300">
      {children}
    </code>
  );
}

interface Props {
  courseId?: string;
  open: boolean;
  onToggle: () => void;
}

export function CourseHelpPanel({ courseId, open, onToggle }: Props) {
  const course = courseId ? courseById.get(courseId) : undefined;

  if (!course) return null;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800/50"
      >
        <span>❓ Besoin d'aide ? — {course.title}</span>
        <span className="text-slate-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="prose-course border-t border-slate-200 px-4 py-3 dark:border-slate-700">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
            Rappel de cours — la réponse n'est jamais donnée directement ici
          </p>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: MarkdownCode }}>
            {course.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
