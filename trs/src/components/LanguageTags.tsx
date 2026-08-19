import type { LanguageTagsDto } from "../api/client";
import type { Snapshot } from "../api/read";
import type { ReadError } from "../hooks/read-outcome";
import { Panel } from "./Panel";
import { Spinner } from "./Spinner";
import { StatusPill } from "./StatusPill";

interface LanguageTagsProps {
  snapshot?: Snapshot<LanguageTagsDto>;
  error: ReadError | null;
  pending: boolean;
  current: string;
  onPick: (langTag: string) => void;
}

const CHIP =
  "rounded-full border px-2.5 py-0.5 font-mono text-[11px] hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700";

export function LanguageTags({
  snapshot,
  error,
  pending,
  current,
  onPick,
}: LanguageTagsProps) {
  const tags = snapshot?.body.languageTags ?? [];

  return (
    <Panel
      title="Published language tags"
      subtitle="GET /modules/{moduleId}/language-tags — the default and managed layers; a tenant's own languages are never listed"
    >
      <div className="px-4 py-3">
        {pending && <Spinner label="Listing language tags…" />}

        {error && (
          <p className="text-xs text-stone-500">
            <StatusPill status={error.status} />{" "}
            {error.status === 404
              ? "Nothing published for this module — the list is a 404, never an empty array."
              : error.message}
          </p>
        )}

        {snapshot && (
          <>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onPick(tag)}
                  className={`${CHIP} ${
                    tag === current
                      ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "border-stone-200 bg-stone-50 text-stone-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="mt-2 truncate font-mono text-[11px] text-stone-400">
              ETag {snapshot.etag ?? "—"} · {tags.length} tag
              {tags.length === 1 ? "" : "s"}
            </p>
          </>
        )}
      </div>
    </Panel>
  );
}
