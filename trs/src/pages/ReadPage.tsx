import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Panel } from "../components/Panel";
import { LookupForm } from "../components/LookupForm";
import { LanguageTags } from "../components/LanguageTags";
import { ResponseMeta } from "../components/ResponseMeta";
import { EntriesTable } from "../components/EntriesTable";
import { ComparePanel } from "../components/ComparePanel";
import { compareScope, type CompareMode } from "../lib/compare";
import { Spinner } from "../components/Spinner";
import { EmptyState } from "../components/EmptyState";
import { ErrorBlock } from "../components/ErrorBlock";
import { StatusPill } from "../components/StatusPill";
import { useTranslations } from "../hooks/useTranslations";
import { useLanguageTags } from "../hooks/useLanguageTags";
import { fetchTranslations } from "../api/read";
import { loadRecent, lookupLabel, rememberLookup, type Lookup } from "../lib/recent";
import {
  compareEntries,
  langTagChoices,
  matchesFilter,
  toKeyedEntries,
} from "../lib/translations";

const SECONDARY =
  "rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50";

interface Revalidation {
  status: number;
  at: string;
}

export function ReadPage() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState<Lookup[]>(loadRecent);
  const [lookup, setLookup] = useState<Lookup>(
    () => recent[0] ?? { moduleId: "", langTag: "en-US" },
  );
  const [filter, setFilter] = useState("");
  const [revalidation, setRevalidation] = useState<Revalidation | null>(null);
  const [revalidating, setRevalidating] = useState(false);
  const [compare, setCompare] = useState<CompareMode>("none");

  const query = useTranslations(lookup);
  const tags = useLanguageTags(lookup.moduleId);
  const snapshot = query.data;
  const resolvedLayers = lookup.tenantId
    ? "Resolved: default + managed + tenant"
    : "Resolved: default + managed";

  const entries = useMemo(
    () => (snapshot ? toKeyedEntries(snapshot.body.entries) : []),
    [snapshot],
  );
  const visible = useMemo(
    () => entries.filter((entry) => matchesFilter(entry, filter)),
    [entries, filter],
  );
  const langTags = useMemo(
    () => langTagChoices(tags.data?.body.languageTags),
    [tags.data],
  );

  const comparison = useTranslations(compareScope(lookup, compare));
  const rows = useMemo(
    () =>
      snapshot && comparison.data
        ? compareEntries(snapshot.body.entries, comparison.data.body.entries)
        : [],
    [snapshot, comparison.data],
  );

  const runLookup = (next: Lookup) => {
    setLookup(next);
    setRecent(rememberLookup(next));
    setRevalidation(null);
    setCompare("none");
  };

  const revalidate = async () => {
    if (!snapshot) return;
    setRevalidating(true);
    try {
      const outcome = await fetchTranslations(
        lookup,
        snapshot.etag
          ? { ifNoneMatch: snapshot.etag }
          : { ifModifiedSince: snapshot.lastModified },
      );
      setRevalidation({
        status: outcome.kind === "ok" ? outcome.snapshot.status : outcome.status,
        at: new Date().toLocaleTimeString(),
      });
      if (outcome.kind === "ok") await query.refetch();
    } finally {
      setRevalidating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-normal text-stone-900">
          Read translations
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          <span className="font-mono text-xs">
            GET {lookup.tenantId ? "/tenants/{tenantId}" : ""}/modules/
            {"{moduleId}"}/translations/{"{langTag}"}
          </span>{" "}
          — anonymous, cacheable, merges the layers in order.
        </p>
      </div>

      <Panel>
        <LookupForm
          initial={lookup}
          recent={recent}
          langTags={langTags}
          onSubmit={runLookup}
        />
      </Panel>

      {lookup.moduleId === "" ? (
        <Panel>
          <EmptyState
            title="Pick a module to resolve."
            hint="The service has no list-modules endpoint — type the module id, or start from demo."
          />
        </Panel>
      ) : (
        <>
          <LanguageTags
            snapshot={tags.data}
            error={tags.error}
            pending={tags.isPending}
            current={lookup.langTag}
            onPick={(langTag) => runLookup({ ...lookup, langTag })}
          />

          <Panel
            title={lookupLabel(lookup)}
            subtitle={snapshot ? resolvedLayers : undefined}
            actions={
              snapshot ? (
                <>
                  <button
                    onClick={revalidate}
                    disabled={revalidating}
                    className={SECONDARY}
                    title="Repeat the request with If-None-Match to demonstrate the 304 path"
                  >
                    {revalidating ? "Revalidating…" : "Revalidate"}
                  </button>
                  <button
                    onClick={() =>
                      navigate("/publish", { state: { snapshot: snapshot.body } })
                    }
                    className={SECONDARY}
                  >
                    Translate this
                  </button>
                </>
              ) : undefined
            }
          >
            {query.isPending && <Spinner label="Fetching translations…" />}

            {query.isError && (
              <div className="p-4">
                <ErrorBlock
                  title={
                    query.error.status === 404
                      ? "No translations published for this module and language tag."
                      : `Read failed (${query.error.status})`
                  }
                >
                  {query.error.message}
                </ErrorBlock>
              </div>
            )}

            {snapshot && (
              <>
                <ResponseMeta
                  status={snapshot.status}
                  etag={snapshot.etag}
                  lastModified={snapshot.lastModified}
                  cacheControl={snapshot.cacheControl}
                  entryCount={entries.length}
                />

                {revalidation && (
                  <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-2 text-xs text-stone-500">
                    <StatusPill
                      status={revalidation.status}
                      label={
                        revalidation.status === 304 ? "Not Modified" : undefined
                      }
                    />
                    <span>
                      revalidated at {revalidation.at}
                      {revalidation.status === 304 &&
                        " — nothing transferred, cached copy still valid"}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filter keys, values, descriptions…"
                    className="w-full max-w-sm rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  />
                  <span className="shrink-0 text-xs text-stone-500">
                    {visible.length} of {entries.length}
                  </span>
                </div>

                <EntriesTable entries={visible} />
              </>
            )}
          </Panel>

          {snapshot && (
            <ComparePanel
              lookup={lookup}
              mode={compare}
              onMode={setCompare}
              rows={rows}
              pending={compare !== "none" && comparison.isPending}
            />
          )}
        </>
      )}
    </div>
  );
}
