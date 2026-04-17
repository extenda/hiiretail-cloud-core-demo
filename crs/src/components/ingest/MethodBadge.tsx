export type HttpMethod = "PUT" | "PATCH" | "DELETE" | "POST" | "GET";

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  POST: "bg-sky-100 text-sky-800 ring-sky-200",
  PUT: "bg-amber-100 text-amber-800 ring-amber-200",
  PATCH: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  DELETE: "bg-red-100 text-red-800 ring-red-200",
};

export function MethodBadge({
  method,
  size = "md",
}: {
  method: HttpMethod;
  size?: "sm" | "md";
}) {
  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] min-w-[44px]"
      : "px-2.5 py-1 text-xs min-w-[58px]";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-mono font-bold uppercase tracking-wide ring-1 ring-inset ${sizeClass} ${METHOD_STYLES[method]}`}
    >
      {method}
    </span>
  );
}
