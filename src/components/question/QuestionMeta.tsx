import type { Question } from "@/types";
import { LEVEL_LABELS, QUESTION_TYPE_LABELS, TOPIC_LABELS } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";

export function QuestionMeta({ question }: { question: Question }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Badge tone="brand">{TOPIC_LABELS[question.topic]}</Badge>
      <Badge>{LEVEL_LABELS[question.level]}</Badge>
      <Badge>{QUESTION_TYPE_LABELS[question.type]}</Badge>
      <StarRating value={question.difficulty} />
      {question.source === "cpython" && (
        <Badge tone="warning" title="Détail d'implémentation CPython">
          détail CPython
        </Badge>
      )}
      {question.source === "version-dependent" && <Badge tone="warning">dépend de la version</Badge>}
    </div>
  );
}
