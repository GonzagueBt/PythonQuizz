import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { OrderingQuestion } from "@/types";

interface Props {
  question: OrderingQuestion;
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
  /** Whether to show correct/incorrect styling (false in exam mode until the exam ends). */
  reveal: boolean;
}

interface RowProps {
  itemId: string;
  index: number;
  label: string;
  disabled: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
  status: "correct" | "wrong" | "neutral";
}

function SortableRow({ itemId, index, label, disabled, onMove, isFirst, isLast, status }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itemId,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stateClasses =
    status === "correct"
      ? "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20"
      : status === "wrong"
        ? "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900";

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm ${stateClasses} ${
        isDragging ? "z-10 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        aria-label={`Glisser pour réordonner : ${label}`}
        disabled={disabled}
        {...attributes}
        {...listeners}
        className="flex h-6 w-6 flex-shrink-0 cursor-grab touch-none items-center justify-center rounded text-slate-400 hover:text-slate-600 active:cursor-grabbing disabled:cursor-default disabled:opacity-40 dark:hover:text-slate-200"
      >
        ⠿
      </button>
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold dark:bg-slate-700">
        {index + 1}
      </span>
      <span className="flex-1">{label}</span>
      <div className="flex gap-1">
        <button
          type="button"
          aria-label="Monter"
          disabled={disabled || isFirst}
          onClick={() => onMove(index, -1)}
          className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-30 dark:border-slate-600"
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Descendre"
          disabled={disabled || isLast}
          onClick={() => onMove(index, 1)}
          className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-30 dark:border-slate-600"
        >
          ↓
        </button>
      </div>
    </li>
  );
}

export function OrderingInput({ question, value, onChange, disabled, reveal }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.indexOf(String(active.id));
    const newIndex = value.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(value, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={value} strategy={verticalListSortingStrategy}>
        <ol className="space-y-2">
          {value.map((itemId, index) => {
            const item = question.items.find((it) => it.id === itemId)!;
            const isCorrectPosition = reveal && question.correctOrder[index] === itemId;
            return (
              <SortableRow
                key={itemId}
                itemId={itemId}
                index={index}
                label={item.label}
                disabled={disabled}
                onMove={move}
                isFirst={index === 0}
                isLast={index === value.length - 1}
                status={reveal ? (isCorrectPosition ? "correct" : "wrong") : "neutral"}
              />
            );
          })}
        </ol>
      </SortableContext>
      {!disabled && (
        <p className="mt-1.5 text-xs text-slate-400">
          Glisse la poignée ⠿ pour réordonner, ou utilise les flèches.
        </p>
      )}
    </DndContext>
  );
}
