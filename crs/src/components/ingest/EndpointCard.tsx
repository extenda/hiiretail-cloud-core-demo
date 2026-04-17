import { useMemo, useState } from "react";
import { MethodBadge, type HttpMethod } from "./MethodBadge";
import { JsonViewer } from "./JsonViewer";
import { CodeSnippet } from "./CodeSnippet";

export type FieldSpec = {
  name: string;
  type: string;
  required: boolean;
  description?: string;
};

export type EndpointSpec = {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  permission?: string;
  fields: FieldSpec[];
  successStatus: string;
  buildSample: () => unknown;
  send: (body: unknown) => Promise<{
    status: number;
    data?: unknown;
    error?: unknown;
  }>;
};

type ExecState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; httpStatus: number; data: unknown }
  | { status: "error"; httpStatus?: number; data: unknown; message?: string };

export function EndpointCard({ endpoint }: { endpoint: EndpointSpec }) {
  const [open, setOpen] = useState(false);
  const initialJson = useMemo(
    () => JSON.stringify(endpoint.buildSample(), null, 2),
    [endpoint],
  );
  const [bodyText, setBodyText] = useState(initialJson);
  const [parseError, setParseError] = useState<string | null>(null);
  const [exec, setExec] = useState<ExecState>({ status: "idle" });

  const parsedBody = useMemo(() => {
    try {
      const parsed = JSON.parse(bodyText);
      return { ok: true as const, value: parsed };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }, [bodyText]);

  const handleExecute = async () => {
    if (!parsedBody.ok) {
      setParseError(parsedBody.error);
      return;
    }
    setParseError(null);
    setExec({ status: "loading" });
    try {
      const res = await endpoint.send(parsedBody.value);
      if (res.error !== undefined && res.error !== null) {
        setExec({
          status: "error",
          httpStatus: res.status,
          data: res.error,
        });
      } else {
        setExec({
          status: "ok",
          httpStatus: res.status,
          data: res.data ?? null,
        });
      }
    } catch (err) {
      setExec({
        status: "error",
        data: null,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleReset = () => {
    setBodyText(JSON.stringify(endpoint.buildSample(), null, 2));
    setParseError(null);
    setExec({ status: "idle" });
  };

  const accent = METHOD_ACCENTS[endpoint.method];

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${
        open ? accent.openBorder : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
          open ? accent.openBg : "hover:bg-slate-50"
        }`}
      >
        <MethodBadge method={endpoint.method} />
        <code className="font-mono text-sm font-semibold text-slate-900">
          {endpoint.path}
        </code>
        <span className="ml-2 truncate text-sm text-slate-600">
          {endpoint.summary}
        </span>
        <svg
          className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="space-y-5 border-t border-slate-200 bg-slate-50/40 px-4 py-5 sm:px-6">
          <p className="text-sm text-slate-600">{endpoint.description}</p>

          {endpoint.permission && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Required permission:</span>
              <code className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-slate-800">
                {endpoint.permission}
              </code>
            </div>
          )}

          <SchemaTable fields={endpoint.fields} />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Request body
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Reset to sample
              </button>
            </div>
            <textarea
              value={bodyText}
              onChange={(e) => {
                setBodyText(e.target.value);
                setParseError(null);
              }}
              spellCheck={false}
              className={`w-full rounded-lg border bg-white p-3 font-mono text-xs text-slate-800 leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                parseError
                  ? "border-red-300 focus:ring-red-400"
                  : "border-slate-300"
              }`}
              rows={Math.min(20, Math.max(6, bodyText.split("\n").length + 1))}
            />
            {parseError && (
              <p className="mt-1 text-xs text-red-600">
                Invalid JSON: {parseError}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExecute}
              disabled={exec.status === "loading"}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${accent.button}`}
            >
              {exec.status === "loading" ? (
                <>
                  <Spinner /> Executing...
                </>
              ) : (
                <>
                  <PlayIcon /> Execute
                </>
              )}
            </button>
            <span className="text-xs text-slate-500">
              Sends a live request using your active OCMS bearer token.
            </span>
          </div>

          <ResponsePanel exec={exec} successStatus={endpoint.successStatus} />

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Code samples
            </div>
            <CodeSnippet
              method={endpoint.method}
              path={endpoint.path}
              body={parsedBody.ok ? parsedBody.value : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SchemaTable({ fields }: { fields: FieldSpec[] }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Body schema
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/80 text-slate-600">
            <tr>
              <th className="px-3 py-2 font-semibold">Field</th>
              <th className="px-3 py-2 font-semibold">Type</th>
              <th className="px-3 py-2 font-semibold">Required</th>
              <th className="px-3 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fields.map((field) => (
              <tr key={field.name}>
                <td className="px-3 py-2 font-mono text-slate-800">
                  {field.name}
                </td>
                <td className="px-3 py-2 font-mono text-slate-600">
                  {field.type}
                </td>
                <td className="px-3 py-2">
                  {field.required ? (
                    <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                      required
                    </span>
                  ) : (
                    <span className="text-slate-400">optional</span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {field.description ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResponsePanel({
  exec,
  successStatus,
}: {
  exec: ExecState;
  successStatus: string;
}) {
  if (exec.status === "idle") {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-xs text-slate-500">
        No response yet. Click <span className="font-medium">Execute</span> to
        send the request. Expected success status:{" "}
        <code className="font-mono text-slate-700">{successStatus}</code>
      </div>
    );
  }
  if (exec.status === "loading") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
        <Spinner /> Waiting for response...
      </div>
    );
  }

  const isOk = exec.status === "ok";
  const status = "httpStatus" in exec ? exec.httpStatus : undefined;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Response
        {status !== undefined && (
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px] font-bold ring-1 ring-inset ${
              isOk
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-red-50 text-red-700 ring-red-200"
            }`}
          >
            {status} {statusText(status)}
          </span>
        )}
      </div>
      {exec.status === "error" && "message" in exec && exec.message && (
        <p className="mb-2 text-xs text-red-600">{exec.message}</p>
      )}
      <JsonViewer value={exec.data} />
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.3 4.5a.5.5 0 01.78-.42l8 5a.5.5 0 010 .84l-8 5a.5.5 0 01-.78-.42v-10z" />
    </svg>
  );
}

function statusText(status: number) {
  return STATUS_TEXTS[status] ?? "";
}

const STATUS_TEXTS: Record<number, string> = {
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  500: "Internal Server Error",
};

const METHOD_ACCENTS: Record<
  HttpMethod,
  { openBg: string; openBorder: string; button: string }
> = {
  GET: {
    openBg: "bg-emerald-50/60",
    openBorder: "border-emerald-300",
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
  POST: {
    openBg: "bg-sky-50/60",
    openBorder: "border-sky-300",
    button: "bg-sky-600 hover:bg-sky-700",
  },
  PUT: {
    openBg: "bg-amber-50/60",
    openBorder: "border-amber-300",
    button: "bg-amber-600 hover:bg-amber-700",
  },
  PATCH: {
    openBg: "bg-indigo-50/60",
    openBorder: "border-indigo-300",
    button: "bg-indigo-600 hover:bg-indigo-700",
  },
  DELETE: {
    openBg: "bg-red-50/60",
    openBorder: "border-red-300",
    button: "bg-red-600 hover:bg-red-700",
  },
};
