import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RichText } from "@/components/ui/RichText";

export function HintPanel({ hints }: { hints: string[] }) {
  const [revealed, setRevealed] = useState(0);

  if (hints.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">💡 Indices</span>
        {revealed < hints.length && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setRevealed((r) => r + 1)}
          >
            {revealed === 0 ? "Afficher un indice" : `Indice suivant (${revealed + 1}/${hints.length})`}
          </Button>
        )}
      </div>
      {revealed === 0 ? (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Bloqué·e ? Révèle un indice à la fois, du plus général au plus précis.
        </p>
      ) : (
        <ol className="space-y-1.5 text-sm text-amber-900 dark:text-amber-200">
          {hints.slice(0, revealed).map((hint, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-semibold">{i + 1}.</span>
              <RichText text={hint} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
