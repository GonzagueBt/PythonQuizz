/**
 * Normalization helpers used to compare user-provided answers against
 * accepted answers / expected outputs without being overly strict about
 * insignificant formatting differences.
 */

/** Strip surrounding quotes/backticks and collapse internal whitespace. */
export function normalizeShortText(raw: string, caseSensitive = false): string {
  let s = raw.trim();
  s = s.replace(/^[`'"]+|[`'"]+$/g, "");
  s = s.replace(/\s+/g, " ").trim();
  // Treat `append()` and `append` as the same short answer.
  s = s.replace(/\(\s*\)$/, "");
  if (!caseSensitive) s = s.toLowerCase();
  return s;
}

export function isTextAnswerCorrect(
  userAnswer: string,
  acceptedAnswers: string[],
  caseSensitive = false,
): boolean {
  const normalizedUser = normalizeShortText(userAnswer, caseSensitive);
  if (normalizedUser.length === 0) return false;
  return acceptedAnswers.some(
    (accepted) => normalizeShortText(accepted, caseSensitive) === normalizedUser,
  );
}

/**
 * Normalize multi-line program output for comparison: unify line endings,
 * drop trailing whitespace on each line and surrounding blank lines, but
 * keep internal spacing (which is often meaningful, e.g. list reprs).
 */
export function normalizeOutput(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");
}

export function isOutputCorrect(userOutput: string, expectedOutput: string): boolean {
  return normalizeOutput(userOutput) === normalizeOutput(expectedOutput);
}
