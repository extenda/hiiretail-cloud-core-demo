const colorMap: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  IsCreditBlocked: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Upcoming: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Expired: 'bg-slate-100 text-slate-500 ring-slate-400/20',
}

export function StatusBadge({ status }: { status: string | undefined }) {
  if (!status) return <span className="text-sm text-slate-400">—</span>
  const colors = colorMap[status] ?? 'bg-slate-100 text-slate-600 ring-slate-500/20'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colors}`}
    >
      {status}
    </span>
  )
}
