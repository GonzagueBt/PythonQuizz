import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "dev-dist", "node_modules", "coverage"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.es2021 },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // The question bank and course content use `Question`/`CourseSection` union
      // types with plenty of legitimate `any` in test fixtures and Pyodide's
      // dynamically-typed JS interop — keep this a warning, not a hard error.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["src/engine/pyodideWorker.ts"],
    languageOptions: { globals: { ...globals.worker } },
  },
  {
    // Context provider + its consumer hook, co-located on purpose (standard
    // React pattern) — the Fast Refresh nudge to split them into separate
    // files doesn't apply here.
    files: ["src/hooks/useProgress.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    files: ["*.config.{js,ts}", "src/test/**/*"],
    languageOptions: { globals: { ...globals.node } },
  },
);
