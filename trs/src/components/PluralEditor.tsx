import type { PluralCategory } from "../api/client";
import type { PluralForms } from "../lib/translations";

const INPUT =
  "w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none";

const ALL_CATEGORIES: PluralCategory[] = ["zero", "one", "two", "few", "many", "other"];

interface PluralEditorProps {
  parameter: string;
  onParameterChange?: (parameter: string) => void;
  forms: PluralForms;
  onFormsChange: (forms: PluralForms) => void;
  requiredCategories: PluralCategory[];
}

export function PluralEditor({
  parameter,
  onParameterChange,
  forms,
  onFormsChange,
  requiredCategories,
}: PluralEditorProps) {
  const required = new Set(requiredCategories);
  // Every category is offered — a layer may publish more than its tag strictly needs — but
  // only the ones en-US's CLDR rules require are shown open by default; the rest stay out of
  // the way unless a value is already there.
  const visible = ALL_CATEGORIES.filter(
    (category) => required.has(category) || (forms[category] ?? "").trim() !== "",
  );

  const setForm = (category: PluralCategory, value: string) =>
    onFormsChange({ ...forms, [category]: value });

  return (
    <div className="mt-2 rounded-lg border border-stone-200 bg-stone-50/60 p-3">
      {onParameterChange && (
        <div className="mb-2 flex items-center gap-2">
          <label className="text-xs font-medium text-stone-600">Count as</label>
          <input
            value={parameter}
            onChange={(e) => onParameterChange(e.target.value)}
            placeholder="count"
            className={`${INPUT} max-w-32 font-mono text-xs`}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visible.map((category) => (
          <div key={category}>
            <label className="mb-0.5 block text-[11px] font-medium text-stone-500">
              {category}
              {required.has(category) && (
                <span className="ml-1 text-amber-600" title="This language tag requires this category">
                  *
                </span>
              )}
            </label>
            <input
              value={forms[category] ?? ""}
              onChange={(e) => setForm(category, e.target.value)}
              placeholder={`{${parameter || "count"}} …`}
              className={INPUT}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
