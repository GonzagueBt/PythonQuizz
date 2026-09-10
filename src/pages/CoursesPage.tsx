import { Link } from "react-router-dom";
import { allCourses } from "@/data/courses";
import { LEVEL_LABELS, TOPIC_LABELS, type Level } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const LEVELS: Level[] = [1, 2, 3, 4, 5, 6];

export function CoursesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cours</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Notions théoriques synthétiques, organisées par niveau. Chaque question d'exercice renvoie vers la section
          pertinente via « Besoin d'aide ? ».
        </p>
      </div>

      {LEVELS.map((level) => {
        const courses = allCourses.filter((c) => c.level === level).sort((a, b) => a.order - b.order);
        if (courses.length === 0) return null;
        return (
          <section key={level}>
            <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
              Niveau {level} — {LEVEL_LABELS[level]}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link key={course.id} to={`/cours/${course.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <Badge tone="brand">{TOPIC_LABELS[course.topic]}</Badge>
                    <h3 className="mt-2 font-semibold text-slate-800 dark:text-slate-100">{course.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.summary}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
