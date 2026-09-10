import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";

export function CodeBlock({ code, language = "python" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <div className="group relative my-2">
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} overflow-x-auto rounded-lg p-3 text-[13px] leading-relaxed`}
            style={style}
          >
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line });
              return (
                <div key={i} {...lineProps}>
                  <span className="mr-3 inline-block w-4 select-none text-right text-slate-500">{i + 1}</span>
                  {line.map((token, key) => {
                    const tokenProps = getTokenProps({ token });
                    return <span key={key} {...tokenProps} />;
                  })}
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md bg-slate-700/70 px-2 py-1 text-xs text-slate-200 opacity-0 transition-opacity hover:bg-slate-700 group-hover:opacity-100"
      >
        {copied ? "Copié !" : "Copier"}
      </button>
    </div>
  );
}
