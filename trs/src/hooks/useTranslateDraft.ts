import { useMemo, useState } from "react";
import type {
  PublishableLayer,
  PublishTranslationFileDto,
} from "../api/client";
import { useTranslations } from "./useTranslations";
import {
  DEFAULT_LAYER_LANG_TAG,
  placeholdersIn,
} from "../lib/translations";

export interface TranslateRow {
  key: string;
  source: string;
  description?: string;
  parameters: string[];
  published?: string;
  inherited?: string;
}

export interface DraftTarget {
  moduleId: string;
  layer: PublishableLayer;
  langTag: string;
  tenantId?: string;
}

const NO_SCOPE = { moduleId: "", langTag: "" };

/*
 * The editor a translator sees: the module's English declarations on one side, what this
 * layer already publishes on the other. Both come from reads, because the service exposes
 * no per-layer GET — a tenant's own value is whatever its read shows that the base read
 * does not.
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
    values: Record<string, string>;
  }>({ signature: "", values: {} });

  const rows = useMemo<TranslateRow[]>(() => {
    const declarations = source.data?.body.entries ?? {};
    const baseEntries = base.data?.body.entries ?? {};
    const tenantEntries = tenant.data?.body.entries ?? {};

    return Object.entries(declarations)
      .map(([key, entry]) => {
        const inherited = baseEntries[key]?.value;
        const own = editingTenant ? tenantEntries[key]?.value : inherited;

        return {
          key,
          source: entry.value,
          description: entry.description,
          parameters: entry.parameters ?? [],
          published: editingTenant && own === inherited ? undefined : own,
          inherited: editingTenant ? inherited : undefined,
        };
      })
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [source.data, base.data, tenant.data, editingTenant]);

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
      Object.fromEntries(rows.map(({ key, published }) => [key, published ?? ""])),
    [rows],
  );
  const values = edits.signature === signature ? edits.values : published;

  const setValue = (key: string, value: string) =>
    setEdits({ signature, values: { ...values, [key]: value } });

  const problems = rows.flatMap(({ key, parameters }) => {
    const value = values[key] ?? "";

    return [...new Set(placeholdersIn(value))]
      .filter((name) => !parameters.includes(name))
      .map((name) => `${key} uses {${name}}, which the key does not declare`);
  });

  const entries: PublishTranslationFileDto["entries"] = Object.fromEntries(
    rows
      .filter(({ key }) => (values[key] ?? "").trim() !== "")
      .map(({ key }) => [key, { value: values[key] }]),
  );

  return {
    rows,
    values,
    setValue,
    sourceMissing: source.isError,
    loading: source.isPending || base.isPending,
    problems,
    entries,
    translated: Object.keys(entries).length,
  };
}
