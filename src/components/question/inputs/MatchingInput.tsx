import { useMemo, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { MatchingQuestion } from "@/types";
import { shuffle } from "@/engine/selection";
import { MATCHING_BANK_ID as BANK_ID, assignChip } from "@/engine/matchingAssignment";

interface Props {
  question: MatchingQuestion;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  disabled: boolean;
  /** Whether to show correct/incorrect styling (false in exam mode until the exam ends). */
  reveal: boolean;
}

function Chip({ chipId, label, disabled }: { chipId: string; label: string; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: chipId, disabled });
  return (
    <button
      ref={setNodeRef}
      type="button"
      disabled={disabled}
      {...attributes}
      {...listeners}
      className={`cursor-grab touch-none rounded-md border border-brand-300 bg-brand-50 px-2.5 py-1.5 text-sm text-brand-800 shadow-sm active:cursor-grabbing disabled:cursor-default dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-200 ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      {label}
    </button>
  );
}

function Slot({
  pairId,
  children,
  statusClasses,
  disabled,
}: {
  pairId: string;
  children: ReactNode;
  statusClasses: string;
  disabled: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${pairId}`, disabled });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[42px] flex-1 items-center rounded-md border-2 border-dashed px-2 py-1.5 transition-colors ${
        isOver ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : statusClasses
      }`}
    >
      {children}
    </div>
  );
}

function Bank({ children, disabled }: { children: ReactNode; disabled: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: BANK_ID, disabled });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[48px] flex-wrap gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700 ${
        isOver ? "bg-brand-50 dark:bg-brand-900/10" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function MatchingInput({ question, value, onChange, disabled, reveal }: Props) {
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const shuffledPairs = useMemo(() => shuffle(question.pairs), [question.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const assignedChipIds = new Set(Object.values(value));
  const unassigned = shuffledPairs.filter((p) => !assignedChipIds.has(p.id));

  const handleDragStart = (event: DragStartEvent) => setActiveChip(String(event.active.id));
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveChip(null);
    const { active, over } = event;
    if (!over) return;
    const target = String(over.id).startsWith("slot-") ? String(over.id).slice(5) : BANK_ID;
    onChange(assignChip(value, String(active.id), target));
  };

  const activeChipData = activeChip ? question.pairs.find((p) => p.id === activeChip) : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-3">
        <div className="space-y-2">
          {question.pairs.map((pair) => {
            const assignedId = value[pair.id];
            const assignedPair = assignedId ? question.pairs.find((p) => p.id === assignedId) : null;
            const isCorrect = reveal && assignedId === pair.id;
            const isWrong = reveal && assignedId !== undefined && assignedId !== pair.id;
            const statusClasses = isCorrect
              ? "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20"
              : isWrong
                ? "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                : "border-slate-300 dark:border-slate-600";

            return (
              <div key={pair.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="text-sm font-medium sm:w-2/5">{pair.left}</span>
                <Slot pairId={pair.id} statusClasses={statusClasses} disabled={disabled}>
                  {assignedPair ? (
                    <Chip chipId={assignedPair.id} label={assignedPair.right} disabled={disabled} />
                  ) : (
                    <span className="text-xs text-slate-400">Dépose une réponse ici</span>
                  )}
                </Slot>
                {isCorrect && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
                {isWrong && (
                  <span className="text-xs text-red-600 dark:text-red-400">Attendu : {pair.right}</span>
                )}
              </div>
            );
          })}
        </div>

        {unassigned.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs text-slate-400">Glisse une réponse vers la case correspondante :</p>
            <Bank disabled={disabled}>
              {unassigned.map((p) => (
                <Chip key={p.id} chipId={p.id} label={p.right} disabled={disabled} />
              ))}
            </Bank>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeChipData ? (
          <div className="cursor-grabbing rounded-md border border-brand-400 bg-brand-100 px-2.5 py-1.5 text-sm text-brand-900 shadow-lg dark:border-brand-600 dark:bg-brand-900/60 dark:text-brand-100">
            {activeChipData.right}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
