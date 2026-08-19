import type { ReadHeaders } from "../api/read";
import { StatusPill } from "./StatusPill";

interface ResponseMetaProps extends ReadHeaders {
  status: number;
  entryCount: number;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
        {label}
      </dt>
      <dd className="truncate font-mono text-xs text-stone-700" title={value}>
        {value}
      </dd>
    </div>
  );
}

export function ResponseMeta({
  status,
  etag,
  lastModified,
  cacheControl,
  entryCount,
}: ResponseMetaProps) {
  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-3 border-b border-stone-100 bg-stone-50/60 px-4 py-3">
      <div>
        <dt className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
          Status
        </dt>
        <dd className="mt-0.5">
          <StatusPill status={status} />
        </dd>
      </div>
      <Field label="Keys" value={String(entryCount)} />
      <Field label="ETag" value={etag ?? "—"} />
      <Field label="Last-Modified" value={lastModified ?? "—"} />
      <Field label="Cache-Control" value={cacheControl ?? "—"} />
    </div>
  );
}
