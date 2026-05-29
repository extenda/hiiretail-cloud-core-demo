const colorMap: Record<string, string> = {
  // Survey statuses
  RUNNING: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  NOT_STARTED: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  MANUALLY_DISABLED: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  ENDED: 'bg-slate-100 text-slate-500 ring-slate-400/20',
  // Response statuses
  IN_PROGRESS: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  DISMISSED: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  ABANDONED: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  IGNORED: 'bg-slate-100 text-slate-500 ring-slate-400/20',
}

const labelMap: Record<string, string> = {
  RUNNING: 'Running',
  NOT_STARTED: 'Not started',
  MANUALLY_DISABLED: 'Disabled',
  ENDED: 'Ended',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  DISMISSED: 'Dismissed',
  ABANDONED: 'Abandoned',
  IGNORED: 'Ignored',
}

export function StatusBadge({ status }: { status: string | undefined }) {
  if (!status) return <span className="text-sm text-slate-400">—</span>
  const colors = colorMap[status] ?? 'bg-slate-100 text-slate-600 ring-slate-500/20'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colors}`}
    >
      {labelMap[status] ?? status}
    </span>
  )
}
