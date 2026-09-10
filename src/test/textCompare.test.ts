import { describe, expect, it } from "vitest";
import { isOutputCorrect, isTextAnswerCorrect, normalizeOutput, normalizeShortText } from "@/utils/textCompare";

describe("normalizeShortText", () => {
  it("trims whitespace and lowercases by default", () => {
    expect(normalizeShortText("  Append  ")).toBe("append");
  });

  it("strips surrounding quotes and backticks", () => {
    expect(normalizeShortText("`append`")).toBe("append");
    expect(normalizeShortText('"append"')).toBe("append");
  });

  it("treats append() and append as equivalent", () => {
    expect(normalizeShortText("append()")).toBe(normalizeShortText("append"));
  });

  it("respects caseSensitive flag", () => {
    expect(normalizeShortText("Append", true)).toBe("Append");
  });

  it("collapses internal whitespace", () => {
    expect(normalizeShortText("with   spaces")).toBe("with spaces");
  });
});

describe("isTextAnswerCorrect", () => {
  it("matches any accepted answer, case-insensitively by default", () => {
    expect(isTextAnswerCorrect("APPEND", ["append", "add"])).toBe(true);
    expect(isTextAnswerCorrect("insert", ["append", "add"])).toBe(false);
  });

  it("rejects empty answers", () => {
    expect(isTextAnswerCorrect("   ", ["append"])).toBe(false);
  });

  it("honors case sensitivity when required", () => {
    expect(isTextAnswerCorrect("Append", ["Append"], true)).toBe(true);
    expect(isTextAnswerCorrect("append", ["Append"], true)).toBe(false);
  });
});

describe("normalizeOutput", () => {
  it("unifies CRLF to LF", () => {
    expect(normalizeOutput("a\r\nb")).toBe("a\nb");
  });

  it("strips trailing whitespace per line", () => {
    expect(normalizeOutput("a   \nb\t")).toBe("a\nb");
  });

  it("trims leading and trailing blank lines but keeps internal ones", () => {
    expect(normalizeOutput("\n\na\n\nb\n\n")).toBe("a\n\nb");
  });

  it("preserves meaningful internal spacing", () => {
    expect(normalizeOutput("[1, 2, 3]")).toBe("[1, 2, 3]");
  });
});

describe("isOutputCorrect", () => {
  it("ignores insignificant whitespace differences", () => {
    expect(isOutputCorrect("1\n2\n", "1\n2")).toBe(true);
    expect(isOutputCorrect("  1\n2", "1\n2")).toBe(false);
  });

  it("is sensitive to actual content differences", () => {
    expect(isOutputCorrect("[1, 2, 3]", "[1,2,3]")).toBe(false);
  });
});
