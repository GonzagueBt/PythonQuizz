import { Link, Navigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { allCourses, courseById } from "@/data/courses";
import { allQuestions } from "@/data/questions";
import { LEVEL_LABELS, TOPIC_LABELS } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

function MarkdownCode({ className, children }: { className?: string; children?: ReactNode }) {
  const match = /language-(\w+)/.exec(className ?? "");
  if (match) return <CodeBlock code={String(children).replace(/\n$/, "")} language={match[1]} />;
  return (
    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-brand-700 dark:bg-slate-800 dark:text-brand-300">
      {children}
    </code>
  );
}

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = courseId ? courseById.get(courseId) : undefined;

  if (!course) return <Navigate to="/cours" replace />;

  const siblings = allCourses
    .filter((c) => c.level === course.level)
    .sort((a, b) => a.order - b.order);
  const currentIndex = siblings.findIndex((c) => c.id === course.id);
  const prev = siblings[currentIndex - 1];
  const next = siblings[currentIndex + 1];

  const relatedQuestions = allQuestions.filter((q) => q.courseId === course.id);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/cours" className="text-sm text-brand-700 hover:underline dark:text-brand-400">
        ← Retour aux cours
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{TOPIC_LABELS[course.topic]}</Badge>
        <Badge>{LEVEL_LABELS[course.level]}</Badge>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{course.title}</h1>

      <Card className="prose-course">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: MarkdownCode }}>
          {course.content}
        </ReactMarkdown>
      </Card>

      {relatedQuestions.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {relatedQuestions.length} question(s) liée(s) à ce cours
          </p>
          <Button
            size="sm"
            onClick={() =>
              navigate("/pratique", {
                state: { title: course.title, questionIds: relatedQuestions.map((q) => q.id) },
              })
            }
          >
            S'entraîner sur ce cours
          </Button>
        </Card>
      )}

      <div className="flex justify-between pt-2 text-sm">
        {prev ? (
          <Link to={`/cours/${prev.id}`} className="text-brand-700 hover:underline dark:text-brand-400">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/cours/${next.id}`} className="text-brand-700 hover:underline dark:text-brand-400">
            {next.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
