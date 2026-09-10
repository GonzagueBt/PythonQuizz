import { Fragment, type ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={`${keyPrefix}-b-${idx++}`}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(
        <code
          key={`${keyPrefix}-c-${idx++}`}
          className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em] text-brand-700 dark:bg-slate-800 dark:text-brand-300"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

/**
 * Renders question/course text supporting a light subset of markdown:
 * fenced ```lang code blocks (with syntax highlighting), `inline code`,
 * **bold**, and line breaks. Deliberately not a full markdown parser —
 * question content never needs more than this.
 */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const segments = text.split(/```(\w+)?\n?([\s\S]*?)```/g);
  const nodes: ReactNode[] = [];

  for (let i = 0; i < segments.length; i += 3) {
    const plain = segments[i];
    const lang = segments[i + 1];
    const code = segments[i + 2];

    if (plain) {
      const lines = plain.split("\n").filter((_, idx, arr) => !(idx === arr.length - 1 && arr[idx] === ""));
      nodes.push(
        <p key={`p-${i}`} className={`whitespace-pre-wrap ${className}`}>
          {lines.map((line, li) => (
            <Fragment key={li}>
              {li > 0 && <br />}
              {renderInline(line, `p-${i}-${li}`)}
            </Fragment>
          ))}
        </p>,
      );
    }
    if (code !== undefined) {
      nodes.push(<CodeBlock key={`c-${i}`} code={code} language={lang || "python"} />);
    }
  }

  return <>{nodes}</>;
}
