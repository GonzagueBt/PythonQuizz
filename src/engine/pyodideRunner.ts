import type { CodeEditorTestCase } from "@/types";

export interface TestOutcome {
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
}

export interface CodeRunResult {
  ok: boolean;
  outcomes: TestOutcome[];
  error?: string;
  timedOut?: boolean;
}

const DEFAULT_TIMEOUT_MS = 10_000;

let worker: Worker | null = null;
let nextRequestId = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./pyodideWorker.ts", import.meta.url));
  }
  return worker;
}

/** True when this browser can run Pyodide-backed code exercises (needs Web Workers). */
export function isCodeExecutionSupported(): boolean {
  return typeof Worker !== "undefined";
}

/**
 * Runs a student's Python code against the exercise's test cases inside a
 * dedicated Web Worker. The worker is hard-terminated on timeout so an
 * infinite loop in student code can never hang the tab or leak forever.
 */
export function runCodeEditorTests(
  code: string,
  tests: CodeEditorTestCase[],
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<CodeRunResult> {
  if (!isCodeExecutionSupported()) {
    return Promise.resolve({
      ok: false,
      outcomes: [],
      error: "L'exécution de code Python nécessite un navigateur supportant les Web Workers.",
    });
  }

  return new Promise((resolve) => {
    const activeWorker = getWorker();
    const id = ++nextRequestId;
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      activeWorker.removeEventListener("message", handleMessage);
      activeWorker.terminate();
      worker = null; // next call gets a fresh worker + fresh Pyodide instance
      resolve({
        ok: false,
        outcomes: [],
        error: "Temps d'exécution dépassé — vérifie qu'il n'y a pas de boucle infinie.",
        timedOut: true,
      });
    }, timeoutMs);

    function handleMessage(event: MessageEvent) {
      const data = event.data as
        | { id: number; ok: true; result: TestOutcome[] }
        | { id: number; ok: false; error: string };
      if (data.id !== id || settled) return;
      settled = true;
      clearTimeout(timer);
      activeWorker.removeEventListener("message", handleMessage);
      if (data.ok) {
        resolve({ ok: data.result.every((o) => o.passed), outcomes: data.result });
      } else {
        resolve({ ok: false, outcomes: [], error: data.error });
      }
    }

    activeWorker.addEventListener("message", handleMessage);
    activeWorker.postMessage({
      id,
      code,
      tests: tests.map((t) => ({ call: t.call, expected: t.expected, description: t.description })),
    });
  });
}
