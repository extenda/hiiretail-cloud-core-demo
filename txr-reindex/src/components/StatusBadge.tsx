import type { CRJStatus, SpannerStatus } from '../api/types'

type Status = CRJStatus | SpannerStatus

const STYLES: Record<Status, string> = {
  // Cloud Run
  RUNNING: 'bg-blue-100 text-blue-800 ring-blue-300',
  SUCCEEDED: 'bg-green-100 text-green-800 ring-green-300',
  FAILED: 'bg-red-100 text-red-800 ring-red-300',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-300',
  // Spanner
  running: 'bg-blue-100 text-blue-800 ring-blue-300',
  completed: 'bg-green-100 text-green-800 ring-green-300',
  failed: 'bg-red-100 text-red-800 ring-red-300',
}

const DOT_STYLES: Record<Status, string> = {
  RUNNING: 'bg-blue-500 animate-pulse',
  SUCCEEDED: 'bg-green-500',
  FAILED: 'bg-red-500',
  CANCELLED: 'bg-slate-400',
  running: 'bg-blue-500 animate-pulse',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
}

interface StatusBadgeProps {
  status: Status
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${STYLES[status] ?? 'bg-slate-100 text-slate-600 ring-slate-300'}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[status] ?? 'bg-slate-400'}`}
      />
      {status}
    </span>
  )
}
