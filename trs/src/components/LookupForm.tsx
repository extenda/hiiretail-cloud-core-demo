import { useState, type FormEvent } from "react";
import { TextField } from "./TextField";
import { SelectInput } from "./SelectInput";
import { MODULE_ID_PATTERN, TENANT_ID_PATTERN } from "../lib/translations";
import { lookupLabel, type Lookup } from "../lib/recent";

interface LookupFormProps {
  initial: Lookup;
  recent: Lookup[];
  langTags: readonly string[];
  onSubmit: (lookup: Lookup) => void;
}

export function LookupForm({
  initial,
  recent,
  langTags,
  onSubmit,
}: LookupFormProps) {
  const [moduleId, setModuleId] = useState(initial.moduleId);
  const [langTag, setLangTag] = useState(initial.langTag);
  const [tenantId, setTenantId] = useState(initial.tenantId ?? "");

  const trimmedModule = moduleId.trim();
  const trimmedTenant = tenantId.trim();
  const invalidModule =
    trimmedModule !== "" && !MODULE_ID_PATTERN.test(trimmedModule);
  const invalidTenant =
    trimmedTenant !== "" && !TENANT_ID_PATTERN.test(trimmedTenant);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (trimmedModule === "" || invalidModule || invalidTenant) return;
    onSubmit({
      moduleId: trimmedModule,
      langTag,
      ...(trimmedTenant ? { tenantId: trimmedTenant } : {}),
    });
  };

  const pick = (lookup: Lookup) => {
    setModuleId(lookup.moduleId);
    setLangTag(lookup.langTag);
    setTenantId(lookup.tenantId ?? "");
    onSubmit(lookup);
  };

  return (
    <form onSubmit={submit} className="px-4 py-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_auto] sm:items-start">
        <TextField
          id="moduleId"
          label="Module"
          mono
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          placeholder="demo"
          hint={
            invalidModule
              ? "Lowercase letters, digits and hyphens; must start with a letter."
              : undefined
          }
        />
        <TextField
          id="tenantId"
          label="Tenant (optional)"
          mono
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          placeholder="leave empty for the base read"
          hint={
            invalidTenant
              ? "Letters, digits, hyphen and underscore."
              : "Set it to merge that tenant's overrides on top."
          }
        />
        <SelectInput
          id="langTag"
          label="Language tag"
          value={langTag}
          onChange={(e) => setLangTag(e.target.value)}
          options={langTags.map((tag) => ({ value: tag, label: tag }))}
        />
        <button
          type="submit"
          disabled={trimmedModule === "" || invalidModule || invalidTenant}
          className="rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-[22px]"
        >
          Fetch
        </button>
      </div>

      {recent.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
            Recent
          </span>
          {recent.map((lookup) => (
            <button
              key={lookupLabel(lookup)}
              type="button"
              onClick={() => pick(lookup)}
              className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 font-mono text-[11px] text-stone-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {lookupLabel(lookup)}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
