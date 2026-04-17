import { useState } from "react";

export function JsonViewer({
  value,
  maxHeight = "max-h-96",
}: {
  value: unknown;
  maxHeight?: string;
}) {
  const [copied, setCopied] = useState(false);
  const text =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 rounded-md border border-slate-700/40 bg-slate-800/70 px-2 py-1 text-[10px] font-medium text-slate-200 opacity-0 transition group-hover:opacity-100 hover:bg-slate-700"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre
        className={`overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100 font-mono ${maxHeight}`}
      >
        <code>{text}</code>
      </pre>
    </div>
  );
}
