import { useState } from "react";

export function JsonBlock({
  value,
  maxHeight = "max-h-72",
}: {
  value: unknown;
  maxHeight?: string;
}) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(value, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard is blocked in some browsers; the text is on screen anyway.
    }
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 rounded-md border border-stone-700 bg-stone-800/80 px-2 py-1 text-[10px] font-medium text-stone-200 opacity-0 transition group-hover:opacity-100 hover:bg-stone-700"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre
        className={`overflow-auto rounded-lg bg-stone-900 p-3 font-mono text-xs leading-relaxed text-stone-100 ${maxHeight}`}
      >
        <code>{text}</code>
      </pre>
    </div>
  );
}
