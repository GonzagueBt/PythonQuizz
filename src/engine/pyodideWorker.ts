// Classic (non-module) worker on purpose: it lets us use `importScripts` to
// pull Pyodide from the CDN, and lets us `terminate()` it to hard-stop a
// runaway user program (e.g. an infinite loop) — something a plain
// Promise-based timeout can never do on the main thread.
//
// This file runs in a worker global scope at runtime, but is compiled as
// part of the same TS program as the main (DOM) app, so `self` here is
// typed as `Window`. We cast once through a narrow local interface instead
// of redeclaring the ambient `self`, which would conflict with the DOM lib.
interface WorkerScope {
  importScripts: (...urls: string[]) => void;
  loadPyodide: (opts: { indexURL: string }) => Promise<any>;
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: (message: unknown) => void;
}

const ctx = self as unknown as WorkerScope;

const PYODIDE_VERSION = "0.26.2";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodideReady: Promise<any> | null = null;

function initPyodide(): Promise<any> {
  if (!pyodideReady) {
    pyodideReady = (async () => {
      ctx.importScripts(`${PYODIDE_CDN}pyodide.js`);
      return ctx.loadPyodide({ indexURL: PYODIDE_CDN });
    })();
  }
  return pyodideReady;
}

// `expected` values in test cases are plain JSON (numbers/strings/bools/
// lists/dicts/null) coming straight from json.loads, so comparing them to
// the student's `actual` with Python's own `==` behaves as expected for
// every exercise in the bank.
const DRIVER_CODE = `
import json

__tests = json.loads(TESTS_JSON)
__ns = {}
__results = []

try:
    exec(USER_CODE, __ns)
except Exception as __e:
    for __t in __tests:
        __results.append({
            "description": __t["description"],
            "passed": False,
            "expected": repr(__t["expected"]),
            "actual": f"{type(__e).__name__}: {__e}",
        })
else:
    for __t in __tests:
        try:
            __actual = eval(__t["call"], __ns)
            __expected = __t["expected"]
            __passed = __actual == __expected
            __results.append({
                "description": __t["description"],
                "passed": bool(__passed),
                "expected": repr(__expected),
                "actual": repr(__actual),
            })
        except Exception as __e:
            __results.append({
                "description": __t["description"],
                "passed": False,
                "expected": repr(__t["expected"]),
                "actual": f"{type(__e).__name__}: {__e}",
            })

json.dumps(__results)
`;

interface RunRequest {
  id: number;
  code: string;
  tests: { call: string; expected: unknown; description: string }[];
}

ctx.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { id, code, tests } = event.data;
  try {
    const pyodide = await initPyodide();
    pyodide.globals.set("USER_CODE", code);
    pyodide.globals.set("TESTS_JSON", JSON.stringify(tests));
    const resultJson = await pyodide.runPythonAsync(DRIVER_CODE);
    ctx.postMessage({ id, ok: true, result: JSON.parse(resultJson) });
  } catch (err) {
    ctx.postMessage({ id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
