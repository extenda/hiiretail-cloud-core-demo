import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Panel } from "../components/Panel";
import { TextField } from "../components/TextField";
import { SelectInput } from "../components/SelectInput";
import { EntryEditor } from "../components/EntryEditor";
import { TranslateEditor } from "../components/TranslateEditor";
import { PublishResult } from "../components/PublishResult";
import { LayerNote } from "../components/LayerNote";
import { ErrorBlock } from "../components/ErrorBlock";
import { useAuth } from "../auth/useAuth";
import { slotForLayer, SLOT_META } from "../auth/slots";
import { SLOT_IDS, type SlotId } from "../auth/storage";
import { publishLayer, type PublishOutcome } from "../api/publish";
import { useTranslateDraft } from "../hooks/useTranslateDraft";
import type {
  PublishableLayer,
  ResolvedTranslationFileDto,
} from "../api/client";
import {
  emptyRow,
  rowsFromFile,
  rowsToBody,
  validateRows,
  type DraftRow,
} from "../lib/draft";
import {
  DEFAULT_LAYER_LANG_TAG,
  LANG_TAGS,
  MODULE_ID_PATTERN,
} from "../lib/translations";

const LAYER_OPTIONS = [
  { value: "tenant", label: "tenant — one tenant's own overrides" },
  { value: "managed", label: "managed — the global Extenda copy" },
  { value: "default", label: "default — the module's English source" },
];

const LANG_OPTIONS = LANG_TAGS.map((tag) => ({ value: tag, label: tag }));

interface DraftState {
  snapshot?: ResolvedTranslationFileDto;
}

export function PublishPage() {
  const { slots, infos } = useAuth();
  const seed = (useLocation().state as DraftState | null)?.snapshot;

  const [moduleId, setModuleId] = useState(seed?.module ?? "");
  const [layer, setLayer] = useState<PublishableLayer>("tenant");
  const [langTag, setLangTag] = useState(
    seed?.langTag ?? DEFAULT_LAYER_LANG_TAG,
  );
  const [slotOverride, setSlotOverride] = useState<SlotId | null>(null);
  const [rows, setRows] = useState<DraftRow[]>(() =>
    seed ? rowsFromFile(seed) : [emptyRow()],
  );
  const [outcome, setOutcome] = useState<PublishOutcome | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const held = SLOT_IDS.filter((slot) => slots[slot] !== undefined);
  const preferred = slotForLayer(layer);
  const slot =
    slotOverride ??
    (preferred && held.includes(preferred) ? preferred : held[0]);
  const token = slot ? slots[slot] : undefined;
  const writesFor = slot ? infos[slot]?.tenantId : undefined;

  const effectiveLangTag =
    layer === "default" ? DEFAULT_LAYER_LANG_TAG : langTag;
  const trimmedModule = moduleId.trim();
  const moduleValid = MODULE_ID_PATTERN.test(trimmedModule);
  const authoring = layer === "default";

  const draft = useTranslateDraft({
    moduleId: authoring || !moduleValid ? "" : trimmedModule,
    layer,
    langTag: effectiveLangTag,
    tenantId: layer === "tenant" ? writesFor : undefined,
  });

  const problems = authoring ? validateRows(rows) : draft.problems;
  const nothingToPublish = !authoring && draft.translated === 0;
  const canSubmit =
    token !== undefined &&
    moduleValid &&
    problems.length === 0 &&
    !nothingToPublish &&
    !submitting;

  const patchRow = (id: number, patch: Partial<DraftRow>) =>
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );

  const submit = async () => {
    if (!token) return;
    setSubmitting(true);
    setOutcome(null);
    setFailure(null);
    try {
      setOutcome(
        await publishLayer({
          moduleId: trimmedModule,
          langTag: effectiveLangTag,
          layer,
          body: authoring ? rowsToBody(rows, layer) : { entries: draft.entries },
          token,
        }),
      );
    } catch (err) {
      setFailure(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-normal text-stone-900">Publish layer</h1>
        <p className="mt-1 text-sm text-stone-500">
          <span className="font-mono text-xs">
            PUT /modules/{"{moduleId}"}/translations/{"{langTag}"}/layers/
            {"{layer}"}
          </span>{" "}
          — replaces the whole file. <span className="font-mono">201</span> when
          it was new, <span className="font-mono">200</span> when it replaced
          one. Which caller may publish which layer is decided per path, not by
          separate permissions.
        </p>
      </div>

      {held.length === 0 && (
        <ErrorBlock title="Read-only session">
          Publishing needs a token holding{" "}
          <span className="font-mono">trs.translation.publish</span>. Add one on
          the{" "}
          <Link to="/tokens" className="underline">
            Tokens
          </Link>{" "}
          page.
        </ErrorBlock>
      )}

      <Panel title="Target">
        <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-4">
          <TextField
            id="moduleId"
            label="Module"
            mono
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            placeholder="demo"
            hint={
              trimmedModule !== "" && !moduleValid
                ? "Lowercase letters, digits and hyphens; must start with a letter."
                : undefined
            }
          />
          <SelectInput
            id="layer"
            label="Layer"
            value={layer}
            onChange={(e) => {
              setLayer(e.target.value as PublishableLayer);
              setSlotOverride(null);
            }}
            options={LAYER_OPTIONS}
          />
          <SelectInput
            id="langTag"
            label="Language tag"
            value={effectiveLangTag}
            disabled={layer === "default"}
            onChange={(e) => setLangTag(e.target.value)}
            options={LANG_OPTIONS}
            hint={
              layer === "default"
                ? "The default layer only accepts en-US."
                : undefined
            }
          />
          <SelectInput
            id="slot"
            label="Token"
            value={slot ?? ""}
            disabled={held.length === 0}
            onChange={(e) => setSlotOverride(e.target.value as SlotId)}
            options={
              held.length === 0
                ? [{ value: "", label: "none held" }]
                : held.map((id) => ({
                    value: id,
                    label: `${SLOT_META[id].label}${
                      infos[id]?.tenantId ? ` · ${infos[id]?.tenantId}` : ""
                    }`,
                  }))
            }
            hint={
              layer === "tenant" && writesFor
                ? `Writes under tenant ${writesFor}.`
                : undefined
            }
          />
        </div>
      </Panel>

      <LayerNote layer={layer} />

      {authoring ? (
        <Panel
          title="Entries"
          subtitle={`${rows.length} key${rows.length === 1 ? "" : "s"} — the file is replaced in full`}
        >
          <EntryEditor
            rows={rows}
            layer={layer}
            onChange={patchRow}
            onRemove={(id) =>
              setRows((current) => current.filter((row) => row.id !== id))
            }
            onAdd={() => setRows((current) => [...current, emptyRow()])}
          />
        </Panel>
      ) : (
        <Panel
          title="Translate"
          subtitle={`${draft.translated} of ${draft.rows.length} keys translated — the file is replaced in full, so a key left empty is not published`}
        >
          {!moduleValid && (
            <p className="px-4 py-3 text-xs text-stone-500">
              Name a module to load its English source.
            </p>
          )}
          {moduleValid && draft.sourceMissing && (
            <div className="p-4">
              <ErrorBlock title="This module has nothing to translate yet">
                Its <span className="font-mono">default/en-US</span> file is what
                declares the keys, and the module has not published one.
              </ErrorBlock>
            </div>
          )}
          {moduleValid && !draft.sourceMissing && (
            <TranslateEditor
              rows={draft.rows}
              values={draft.values}
              langTag={effectiveLangTag}
              onChange={draft.setValue}
            />
          )}
        </Panel>
      )}

      {problems.length > 0 && (
        <ErrorBlock title="Fix before publishing">
          <ul className="list-inside list-disc space-y-0.5">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </ErrorBlock>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Publishing…" : "Publish"}
        </button>
        <span className="font-mono text-xs text-stone-500">
          PUT /modules/{trimmedModule || "{moduleId}"}/translations/
          {effectiveLangTag}/layers/{layer}
          {layer === "tenant"
            ? ` · tenant ${writesFor ?? "from token"}`
            : ""}
        </span>
      </div>

      {failure && <ErrorBlock title="Request failed">{failure}</ErrorBlock>}
      {outcome && (
        <Panel title="Response">
          <PublishResult outcome={outcome} layer={layer} />
        </Panel>
      )}
    </div>
  );
}
