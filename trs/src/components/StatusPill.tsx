const PILL = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset font-mono";

function toneFor(status: number): string {
  if (status === 304) return "bg-sky-50 text-sky-700 ring-sky-600/20";
  if (status >= 200 && status < 300)
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  if (status === 403 || status === 422)
    return "bg-amber-50 text-amber-700 ring-amber-600/20";
  if (status >= 400) return "bg-red-50 text-red-700 ring-red-600/20";

  return "bg-stone-100 text-stone-600 ring-stone-500/20";
}

export function StatusPill({
  status,
  label,
}: {
  status: number;
  label?: string;
}) {
  return (
    <span className={`${PILL} ${toneFor(status)}`}>
      {status}
      {label ? ` ${label}` : ""}
    </span>
  );
}
