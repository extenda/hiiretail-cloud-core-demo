import { useEffect, useRef, useState } from "react";
import type { LanguageTagCoverageDto } from "../api/client";
import { languageName } from "../lib/translations";

interface LanguageStatsDropdownProps {
  langTags: readonly string[];
  value: string;
  onChange: (langTag: string) => void;
  coverage?: readonly LanguageTagCoverageDto[];
}

function Fraction({ coverage }: { coverage?: LanguageTagCoverageDto }) {
  if (!coverage) {
    return <span className="text-xs text-stone-400">not started</span>;
  }

  const { totalKeys, translatedKeys, missingKeys } = coverage;

  return (
    <span className="text-xs text-stone-500">
      {translatedKeys}/{totalKeys}
      {missingKeys > 0 && (
        <span className="ml-1 text-amber-600">· {missingKeys} missing</span>
      )}
    </span>
  );
}

// The language picker doubles as the module's coverage summary, so choosing where to translate
// next and seeing what's incomplete are the same click instead of two screens.
export function LanguageStatsDropdown({
  langTags,
  value,
  onChange,
  coverage,
}: LanguageStatsDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);

    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const byTag = new Map(coverage?.map((row) => [row.langTag, row]));
  const current = byTag.get(value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-left hover:bg-stone-50"
      >
        <span className="text-sm font-medium text-stone-900">
          {languageName(value)}
        </span>
        <Fraction coverage={current} />
        <span className="text-stone-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
          {langTags.map((tag) => {
            const tagCoverage = byTag.get(tag);
            const pct =
              tagCoverage && tagCoverage.totalKeys > 0
                ? Math.round((tagCoverage.translatedKeys / tagCoverage.totalKeys) * 100)
                : 0;

            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onChange(tag);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-stone-50 ${
                  tag === value ? "bg-brand-50" : ""
                }`}
              >
                <span className="w-36 shrink-0 truncate text-sm text-stone-800">
                  {languageName(tag)}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                  <span
                    className="block h-full rounded-full bg-brand-500"
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="w-28 shrink-0 text-right">
                  <Fraction coverage={tagCoverage} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
