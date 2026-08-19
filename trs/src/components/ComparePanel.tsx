import type { Lookup } from "../lib/recent";
import type { CompareMode } from "../lib/compare";
import { DEFAULT_LAYER_LANG_TAG, type CompareRow } from "../lib/translations";
import { CompareTable } from "./CompareTable";
import { Panel } from "./Panel";
import { Spinner } from "./Spinner";

const NOTES: Record<Exclude<CompareMode, "none">, string> = {
  english:
    "A key absent on the left is untranslated. The service never falls back, so a client fetches en-US alongside its target tag and falls back key by key.",
  base: "Rows marked differs are this tenant's overrides. A tenant may only translate keys the module already declared, so it never adds one.",
};

const TAB = "rounded-lg px-3 py-1.5 text-xs font-medium";

interface ComparePanelProps {
  lookup: Lookup;
  mode: CompareMode;
  rows: CompareRow[];
  pending: boolean;
  onMode: (mode: CompareMode) => void;
}

export function ComparePanel({
  lookup,
  mode,
  rows,
  pending,
  onMode,
}: ComparePanelProps) {
  const options: { mode: CompareMode; label: string }[] = [
    { mode: "none", label: "Off" },
    ...(lookup.langTag === DEFAULT_LAYER_LANG_TAG
      ? []
      : [{ mode: "english" as CompareMode, label: `vs ${DEFAULT_LAYER_LANG_TAG}` }]),
    ...(lookup.tenantId
      ? [{ mode: "base" as CompareMode, label: "vs base (no tenant)" }]
      : []),
  ];

  if (options.length === 1) {
    return null;
  }

  const rightLabel =
    mode === "english" ? DEFAULT_LAYER_LANG_TAG : "default + managed";

  return (
    <Panel
      title="Compare"
      subtitle="Two reads side by side — what a consumer actually has to handle"
      actions={
        <div className="flex gap-1">
          {options.map((option) => (
            <button
              key={option.mode}
              onClick={() => onMode(option.mode)}
              className={`${TAB} ${
                option.mode === mode
                  ? "bg-brand-50 text-brand-700"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
    >
      {mode === "none" ? (
        <p className="px-4 py-3 text-xs text-stone-500">
          Pick a comparison to see how the layers and the language fallback
          behave.
        </p>
      ) : (
        <>
          <p className="border-b border-stone-100 bg-stone-50/60 px-4 py-2 text-xs text-stone-600">
            {NOTES[mode]}
          </p>
          {pending ? (
            <Spinner label="Fetching the other read…" />
          ) : (
            <CompareTable
              rows={rows}
              leftLabel={
                lookup.tenantId && mode === "base"
                  ? `${lookup.langTag} · tenant ${lookup.tenantId}`
                  : lookup.langTag
              }
              rightLabel={rightLabel}
            />
          )}
        </>
      )}
    </Panel>
  );
}
