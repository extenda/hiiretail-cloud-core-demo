import { useMemo, useState } from "react";
import type {
  PluralCategory,
  PublishableLayer,
  PublishTranslationFileDto,
  TranslationEntryDto,
} from "../api/client";
import { useTranslations } from "./useTranslations";
import {
  DEFAULT_LAYER_LANG_TAG,
  placeholdersIn,
  requiredPluralCategories,
} from "../lib/translations";
import type { PluralForms, UploadedValue } from "../lib/translations";

export interface TranslateRow {
  key: string;
  source: string;
  description?: string;
  parameters: string[];
  published?: string;
  inherited?: string;
  hasPlural: boolean;
  requiredCategories: PluralCategory[];
  publishedForms: PluralForms;
  inheritedForms?: PluralForms;
}

export interface DraftTarget {
  moduleId: string;
  layer: PublishableLayer;
  langTag: string;
  tenantId?: string;
}

export interface DraftValue {
  value: string;
  forms: PluralForms;
}

const NO_SCOPE = { moduleId: "", langTag: "" };
const EMPTY: DraftValue = { value: "", forms: {} };

function nonEmptyForms(forms: PluralForms): PluralForms {
  return Object.fromEntries(
    Object.entries(forms).filter(([, value]) => (value ?? "").trim() !== ""),
  ) as PluralForms;
}

/*
 * The editor a translator sees: the module's English declarations on one side, what this
 * layer already publishes on the other. Both come from reads, because the service exposes
 * no per-layer GET — a tenant's own value is whatever its read shows that the base read
 * does not. Plural forms follow the same derivation, one form set per layer.
 */
export function useTranslateDraft({
  moduleId,
  layer,
  langTag,
  tenantId,
}: DraftTarget) {
  const editingTenant = layer === "tenant";
  const source = useTranslations({
    moduleId,
    langTag: DEFAULT_LAYER_LANG_TAG,
  });
  const base = useTranslations({ moduleId, langTag });
  const tenant = useTranslations(
    editingTenant && tenantId ? { moduleId, langTag, tenantId } : NO_SCOPE,
  );

  const [edits, setEdits] = useState<{
    signature: string;
    values: Record<string, DraftValue>;
  }>({ signature: "", values: {} });

  const requiredCategories = useMemo(
    () => requiredPluralCategories(langTag),
    [langTag],
  );

  const rows = useMemo<TranslateRow[]>(() => {
    const declarations: Record<string, TranslationEntryDto> =
      source.data?.body.entries ?? {};
    const baseEntries: Record<string, TranslationEntryDto> =
      base.data?.body.entries ?? {};
    const tenantEntries: Record<string, TranslationEntryDto> =
      tenant.data?.body.entries ?? {};

    return Object.entries(declarations)
      .map(([key, entry]) => {
        const inherited = baseEntries[key]?.value;
        const own = editingTenant ? tenantEntries[key]?.value : inherited;
        const inheritedForms = baseEntries[key]?.plural?.forms;
        const ownForms = editingTenant
          ? tenantEntries[key]?.plural?.forms
          : inheritedForms;

        return {
          key,
          source: entry.value,
          description: entry.description,
          parameters: entry.parameters ?? [],
          published: editingTenant && own === inherited ? undefined : own,
          inherited: editingTenant ? inherited : undefined,
          hasPlural: entry.plural !== undefined,
          requiredCategories,
          publishedForms: ownForms ?? {},
          inheritedForms: editingTenant ? inheritedForms : undefined,
        };
      })
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [source.data, base.data, tenant.data, editingTenant, requiredCategories]);

  /*
   * The edits belong to one target and one pair of reads: when either changes the draft is
   * seeded from what that layer publishes again, rather than carrying typing across a switch.
   */
  const signature = [
    moduleId,
    layer,
    langTag,
    tenantId ?? "",
    source.data?.etag ?? "",
    base.data?.etag ?? "",
    tenant.data?.etag ?? "",
  ].join("|");

  const published = useMemo(
    () =>
      Object.fromEntries(
        rows.map(({ key, published, publishedForms }) => [
          key,
          { value: published ?? "", forms: publishedForms },
        ]),
      ),
    [rows],
  );
  const values = edits.signature === signature ? edits.values : published;
  const valueOf = (key: string): DraftValue => values[key] ?? EMPTY;

  const setValue = (key: string, value: string) =>
    setEdits({
      signature,
      values: { ...values, [key]: { ...valueOf(key), value } },
    });

  const setForms = (key: string, forms: PluralForms) =>
    setEdits({
      signature,
      values: { ...values, [key]: { ...valueOf(key), forms } },
    });

  /*
   * A bulk fill from an uploaded file: computed as one next-values object and one setEdits
   * call, rather than looping setValue/setForms, which would each close over the same
   * pre-upload `values` and clobber one another.
   */
  const importValues = (uploaded: Record<string, UploadedValue>) => {
    const next = { ...values };
    const matchedKeys: string[] = [];

    for (const row of rows) {
      const entry = uploaded[row.key];
      if (!entry) continue;
      matchedKeys.push(row.key);
      next[row.key] = { value: entry.value, forms: entry.forms ?? {} };
    }

    if (matchedKeys.length > 0) {
      setEdits({ signature, values: next });
    }

    return {
      matched: matchedKeys.length,
      unmatched: Object.keys(uploaded).filter((key) => !matchedKeys.includes(key)),
    };
  };

  const problems = rows.flatMap(({ key, parameters }) => {
    const draft = valueOf(key);
    const strings = [draft.value, ...Object.values(nonEmptyForms(draft.forms))];

    return [...new Set(strings.flatMap(placeholdersIn))]
      .filter((name) => !parameters.includes(name))
      .map((name) => `${key} uses {${name}}, which this key does not allow.`);
  });

  const entries: PublishTranslationFileDto["entries"] = Object.fromEntries(
    rows
      .filter(({ key }) => valueOf(key).value.trim() !== "")
      .map(({ key }) => {
        const draft = valueOf(key);
        const forms = nonEmptyForms(draft.forms);

        return [
          key,
          {
            value: draft.value,
            ...(Object.keys(forms).length > 0 ? { plural: { forms } } : {}),
          },
        ];
      }),
  );

  return {
    rows,
    values,
    setValue,
    setForms,
    importValues,
    requiredCategories,
    sourceMissing: source.isError,
    loading: source.isPending || base.isPending,
    problems,
    entries,
    translated: Object.keys(entries).length,
  };
}
