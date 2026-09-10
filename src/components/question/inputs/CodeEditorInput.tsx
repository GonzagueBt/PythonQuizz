import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import type { CodeEditorQuestion } from "@/types";
import { isCodeExecutionSupported, runCodeEditorTests, type CodeRunResult } from "@/engine/pyodideRunner";
import { Button } from "@/components/ui/Button";

export interface CodeEditorDraft {
  code: string;
  passedAll?: boolean;
}

interface Props {
  question: CodeEditorQuestion;
  value: CodeEditorDraft;
  onChange: (value: CodeEditorDraft) => void;
  disabled: boolean;
}

export function CodeEditorInput({ question, value, onChange, disabled }: Props) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CodeRunResult | null>(null);
  const supported = isCodeExecutionSupported();

  const handleRun = async () => {
    setRunning(true);
    const res = await runCodeEditorTests(value.code, question.testCases);
    setResult(res);
    setRunning(false);
    onChange({ ...value, passedAll: res.ok });
  };

  const handleReset = () => {
    onChange({ code: question.starterCode, passedAll: undefined });
    setResult(null);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
        <CodeMirror
          value={value.code}
          height="220px"
          theme="dark"
          extensions={[python()]}
          editable={!disabled}
          onChange={(code) => onChange({ ...value, code })}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={handleRun} disabled={disabled || running || !supported}>
          {running ? "Exécution..." : "▶ Exécuter les tests"}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={handleReset} disabled={disabled}>
          Réinitialiser
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            void navigator.clipboard?.writeText(value.code);
          }}
        >
          Copier
        </Button>
      </div>

      {!supported && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          L'exécution de code nécessite un navigateur supportant les Web Workers.
        </p>
      )}
      {running && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Chargement de l'environnement Python (Pyodide) — la première exécution peut prendre quelques secondes...
        </p>
      )}

      {result && (
        <div className="space-y-1.5 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
          {result.error && <p className="text-red-600 dark:text-red-400">{result.error}</p>}
          {result.outcomes.map((o, i) => (
            <div
              key={i}
              className={`flex flex-col gap-0.5 rounded px-2 py-1 ${
                o.passed ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <span
                className={o.passed ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}
              >
                {o.passed ? "✓" : "✗"} {o.description}
              </span>
              {!o.passed && (
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  attendu {o.expected} — obtenu {o.actual}
                </span>
              )}
            </div>
          ))}
          <p
            className={`pt-1 text-sm font-semibold ${
              result.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {result.ok ? "Tous les tests passent !" : "Certains tests échouent encore."}
          </p>
        </div>
      )}
    </div>
  );
}
