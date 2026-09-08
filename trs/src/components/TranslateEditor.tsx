import type { ReactNode } from "react";
import type { KeyCoverageDto } from "../api/client";
import type { PluralForms } from "../lib/translations";
import { DEFAULT_LAYER_LANG_TAG, languageName } from "../lib/translations";
import type { DraftValue, TranslateRow } from "../hooks/useTranslateDraft";
import { PluralEditor } from "./PluralEditor";

const HEAD =
  "px-3 pb-1 text-left text-[10px] font-semibold tracking-wider text-stone-500 uppercase";

const INPUT =
  "w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none";

interface TranslateEditorProps {
  rows: TranslateRow[];
  values: Record<string, DraftValue>;
  langTag: string;
  editingTenant: boolean;
  readOnly?: boolean;
  issuesByKey?: Record<string, KeyCoverageDto>;
  onChange: (key: string, value: string) => void;
  onFormsChange: (key: string, forms: PluralForms) => void;
}

function Badge({
  tone,
  children,
}: {
  tone: "neutral" | "warning" | "error";
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-stone-100 text-stone-600 ring-stone-500/20",
    warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
    error: "bg-red-50 text-red-700 ring-red-600/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// Coverage's other signal, "orphan" (a published key the default layer no longer declares), has
// no row to attach to here on purpose: this table only ever lists declared keys, and a key isn't
// in this draft's outgoing entries unless it's a row here, so an orphan can't be edited or saved
// from this screen without misrepresenting what a Save would actually do to it.
function issueBadges(issue: KeyCoverageDto | undefined) {
  const flags: ReactNode[] = [];
  if (issue?.stale) flags.push(<Badge key="stale" tone="warning">out of date</Badge>);
  if (issue && issue.unusedParameters.length > 0)
    flags.push(
      <Badge key="unused" tone="warning">
        unused: {issue.unusedParameters.join(", ")}
      </Badge>,
    );
  if (issue && issue.missingPluralForms.length > 0)
    flags.push(
      <Badge key="plural" tone="error">
        missing forms: {issue.missingPluralForms.join(", ")}
      </Badge>,
    );

  return flags;
}

function Removal() {
  return (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
      will be removed
    </span>
  );
}

export function TranslateEditor({
  rows,
  values,
  langTag,
  editingTenant,
  readOnly = false,
  issuesByKey,
  onChange,
  onFormsChange,
}: TranslateEditorProps) {
  return (
    <div className="px-4 py-4">
      <table className="w-full">
        <thead>
          <tr>
            <th className={`${HEAD} w-2/5`}>English</th>
            <th className={HEAD}>
              {languageName(langTag)}
              {langTag === DEFAULT_LAYER_LANG_TAG && " override"}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const draft = values[row.key] ?? { value: "", forms: {} };
            const value = draft.value;
            const clearing = row.published !== undefined && value.trim() === "";
            // Missing is a meaningful warning only for the layer actually being translated
            // (managed): a tenant row with no override just silently inherits the global text,
            // which the "Using the global text" note below already says plainly.
            const missing = !editingTenant && value.trim() === "";
            const badges = [
              ...(missing ? [<Badge key="missing" tone="neutral">missing</Badge>] : []),
              ...issueBadges(issuesByKey?.[row.key]),
            ];

            return (
              <tr key={row.key} className="align-top">
                <td className="px-3 py-2">
                  <p className="text-sm text-stone-800">{row.source}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-stone-400">
                    {row.key}
                    {row.parameters.length > 0 &&
                      ` · {${row.parameters.join("} {")}}`}
                  </p>
                  {row.description && (
                    <p className="mt-0.5 text-xs text-stone-500">
                      {row.description}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {row.hasPlural && (
                      <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20">
                        plural
                      </span>
                    )}
                    {badges}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <p className="px-2.5 py-1.5 text-sm text-stone-900">
                      {value || (
                        <span className="text-stone-400">
                          {row.inherited ?? "not translated"}
                        </span>
                      )}
                    </p>
                  ) : (
                    <input
                      value={value}
                      onChange={(e) => onChange(row.key, e.target.value)}
                      placeholder={row.inherited ?? "not translated"}
                      className={INPUT}
                    />
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    {row.inherited !== undefined && value.trim() === "" && (
                      <span className="text-[11px] text-stone-400">
                        Using the global text
                      </span>
                    )}
                    {!readOnly && clearing && <Removal />}
                  </div>
                  {row.hasPlural && !readOnly && (
                    <PluralEditor
                      parameter=""
                      forms={draft.forms}
                      onFormsChange={(forms) => onFormsChange(row.key, forms)}
                      requiredCategories={row.requiredCategories}
                    />
                  )}
                  {row.hasPlural && readOnly && Object.keys(draft.forms).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(draft.forms).map(([category, formValue]) => (
                        <span
                          key={category}
                          title={formValue}
                          className="rounded-full bg-sky-50 px-1.5 py-0.5 font-mono text-[10px] text-sky-700 ring-1 ring-inset ring-sky-600/20"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                  {row.hasPlural &&
                    row.inheritedForms &&
                    Object.keys(draft.forms).length === 0 && (
                      <p className="mt-1 text-[11px] text-stone-400">
                        Using the global plural forms
                      </p>
                    )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
