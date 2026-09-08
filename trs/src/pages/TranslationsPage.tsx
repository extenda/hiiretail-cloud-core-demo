import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { Panel } from "../components/Panel";
import { LanguageStatsDropdown } from "../components/LanguageStatsDropdown";
import { Spinner } from "../components/Spinner";
import { ErrorBlock } from "../components/ErrorBlock";
import { TranslateEditor } from "../components/TranslateEditor";
import { PublishResult } from "../components/PublishResult";
import { useTranslations } from "../hooks/useTranslations";
import { useLanguageTags } from "../hooks/useLanguageTags";
import { useModuleCoverage, useLanguageTagCoverage } from "../hooks/useCoverage";
import { useTranslateDraft } from "../hooks/useTranslateDraft";
import { useAuth } from "../auth/useAuth";
import { SLOT_IDS } from "../auth/storage";
import {
  layerForSlot,
  layerLabel,
  slotForLayer,
  type WritableLayer,
} from "../auth/slots";
import { publishLayer, type PublishOutcome } from "../api/publish";
import { APPS, appName } from "../lib/apps";
import {
  defaultTargetLangTag,
  langTagChoices,
  languageName,
  matchesFilter,
  parseUploadedTranslations,
} from "../lib/translations";

const LAYER_TAB = "rounded-lg px-3 py-1.5 text-xs font-medium";

function isModuleRead(queryKey: readonly unknown[], moduleId: string): boolean {
  const [kind, first, second] = queryKey;

  return (
    (kind === "language-tags" && first === moduleId) ||
    (kind === "translations" && second === moduleId) ||
    ((kind === "coverage" || kind === "coverage-keys") && first === moduleId)
  );
}

export function TranslationsPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  if (!moduleId || !APPS.some((app) => app.moduleId === moduleId)) {
    return <Navigate to="/" replace />;
  }

  return <ModuleTranslations moduleId={moduleId} />;
}

function ModuleTranslations({ moduleId }: { moduleId: string }) {
  const queryClient = useQueryClient();
  const { slots, infos } = useAuth();

  const tags = useLanguageTags(moduleId);
  const publishedTags = tags.data?.body.languageTags;
  const [langTagOverride, setLangTagOverride] = useState<string | null>(null);
  const langTag = langTagOverride ?? defaultTargetLangTag(publishedTags);
  // English is a selectable target too — the default layer's own English declarations are
  // read-only, but a PM or tenant admin can still override that text at their own layer (a
  // copy fix that shouldn't wait on the module's own repo/pipeline).
  const targetLangTags = langTagChoices(publishedTags);

  const held = SLOT_IDS.filter((slotId) => slots[slotId] !== undefined);
  const availableLayers = held.map(layerForSlot);
  const [layerChoice, setLayerChoice] = useState<WritableLayer>("managed");
  const layer: WritableLayer = availableLayers.includes(layerChoice)
    ? layerChoice
    : (availableLayers[0] ?? "managed");
  const editingTenant = layer === "tenant";
  const slot = slotForLayer(layer)!;
  const token = slots[slot];
  const writesFor = infos[slot]?.tenantId;

  const moduleCoverage = useModuleCoverage(moduleId, slots.extenda);
  // Coverage is a default+managed view only, so it's fetched (and shown) while translating the
  // global copy — a tenant override never appears there, and showing it while editing one would
  // misrepresent what a tenant's own row actually reflects.
  const keyCoverage = useLanguageTagCoverage(
    moduleId,
    editingTenant ? null : langTag,
    slots.extenda,
  );
  const issuesByKey = useMemo(
    () => Object.fromEntries((keyCoverage.data?.keys ?? []).map((row) => [row.key, row])),
    [keyCoverage.data],
  );

  const draft = useTranslateDraft({
    moduleId,
    layer,
    langTag,
    tenantId: editingTenant ? writesFor : undefined,
  });

  // Same query key useTranslateDraft's own base/tenant read already uses, so this shares that
  // cache entry instead of firing a second request — it just exposes the ETag/Last-Modified
  // headers the hook itself doesn't return.
  const activeRead = useTranslations({
    moduleId,
    langTag,
    tenantId: editingTenant ? writesFor : undefined,
  });

  const [filter, setFilter] = useState("");
  const filteredRows = useMemo(
    () => draft.rows.filter((row) => matchesFilter(row, filter)),
    [draft.rows, filter],
  );

  const [outcome, setOutcome] = useState<PublishOutcome | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readOnly = token === undefined;
  const title = `${appName(moduleId)} · ${languageName(langTag)}${
    editingTenant && writesFor ? ` · ${writesFor}` : ""
  }`;

  const canSubmit =
    !readOnly && draft.problems.length === 0 && draft.translated > 0 && !submitting;

  const handleUpload = async (file: File) => {
    const text = await file.text();
    const parsed = parseUploadedTranslations(text);

    if ("error" in parsed) {
      setImportMessage({ kind: "error", text: parsed.error });
      return;
    }

    const { matched, unmatched } = draft.importValues(parsed.entries);
    setOutcome(null);
    setFailure(null);
    setImportMessage({
      kind: matched > 0 ? "ok" : "error",
      text:
        matched === 0
          ? `None of the uploaded keys match ${title}'s declared keys.`
          : unmatched.length === 0
            ? `Filled ${matched} key${matched === 1 ? "" : "s"} from the upload.`
            : `Filled ${matched} key${matched === 1 ? "" : "s"} from the upload. ` +
              `${unmatched.length} uploaded key${unmatched.length === 1 ? "" : "s"} ` +
              `${unmatched.length === 1 ? "isn't" : "aren't"} declared here: ${unmatched.join(", ")}.`,
    });
  };

  const submit = async () => {
    if (!token) return;
    setSubmitting(true);
    setOutcome(null);
    setFailure(null);
    try {
      const published = await publishLayer({
        moduleId,
        langTag,
        layer,
        body: { entries: draft.entries },
        token,
      });
      setOutcome(published);
      if (published.status >= 200 && published.status < 300) {
        await queryClient.invalidateQueries({
          predicate: (query) => isModuleRead(query.queryKey, moduleId),
        });
      }
    } catch (err) {
      setFailure(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Link to="/" className="text-xs text-stone-500 hover:text-stone-700">
          ← Apps
        </Link>
        <h1 className="mt-1 text-xl font-normal text-stone-900">
          {appName(moduleId)}
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <LanguageStatsDropdown
          langTags={targetLangTags}
          value={langTag}
          onChange={setLangTagOverride}
          coverage={moduleCoverage.data?.languageTags}
        />

        {held.length === 0 ? (
          <span className="text-xs text-stone-500">
            Read-only —{" "}
            <Link to="/tokens" className="underline">
              sign in
            </Link>{" "}
            to translate.
          </span>
        ) : availableLayers.length === 2 ? (
          <div className="flex gap-1">
            {(["managed", "tenant"] as WritableLayer[]).map((option) => (
              <button
                key={option}
                onClick={() => setLayerChoice(option)}
                className={`${LAYER_TAB} ${
                  option === layer
                    ? "bg-brand-50 text-brand-700"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {layerLabel(option)}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-stone-500">
            {layerLabel(layer)}
            {writesFor ? ` · ${writesFor}` : ""}
          </span>
        )}
      </div>

      {draft.sourceMissing ? (
        <ErrorBlock title="No English source yet for this app." />
      ) : (
        <Panel
          title={`Translate ${title}`}
          subtitle={`${draft.translated} of ${draft.rows.length} keys filled. Empty fields are not saved.`}
          actions={
            readOnly ? undefined : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void handleUpload(file);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Upload JSON…
                </button>
              </>
            )
          }
        >
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search keys or text…"
              className="w-full max-w-sm rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
            <span className="shrink-0 text-xs text-stone-500">
              {filteredRows.length} of {draft.rows.length}
            </span>
          </div>

          {importMessage && (
            <div className="px-4 pt-3">
              <p
                className={`text-xs ${
                  importMessage.kind === "error" ? "text-red-700" : "text-emerald-700"
                }`}
              >
                {importMessage.text}
              </p>
            </div>
          )}

          {draft.loading ? (
            <div className="p-4">
              <Spinner label="Loading translations…" />
            </div>
          ) : (
            <TranslateEditor
              rows={filteredRows}
              values={draft.values}
              langTag={langTag}
              editingTenant={editingTenant}
              readOnly={readOnly}
              issuesByKey={editingTenant ? undefined : issuesByKey}
              onChange={draft.setValue}
              onFormsChange={draft.setForms}
            />
          )}

          {!readOnly && draft.problems.length > 0 && (
            <div className="px-4 pb-2">
              <ErrorBlock title="Fix these before saving">
                <ul className="list-inside list-disc space-y-0.5">
                  {draft.problems.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              </ErrorBlock>
            </div>
          )}

          {!readOnly && (
            <div className="flex items-center gap-3 border-t border-stone-100 px-4 py-3">
              <button
                onClick={submit}
                disabled={!canSubmit}
                className="rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          )}

          {failure && (
            <div className="px-4 pb-4">
              <ErrorBlock title="Couldn't save">{failure}</ErrorBlock>
            </div>
          )}
          {outcome && <PublishResult outcome={outcome} />}

          {activeRead.data && (
            <div className="border-t border-stone-100 px-4 py-2 text-[11px] text-stone-400">
              {activeRead.data.etag && <>ETag {activeRead.data.etag} · </>}
              <button
                onClick={() => activeRead.refetch()}
                className="underline hover:text-stone-600"
              >
                Revalidate
              </button>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
