interface ProgressBarProps {
  count: number
  total?: number | null
  isRunning: boolean
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

export function ProgressBar({ count, total, isRunning }: ProgressBarProps) {
  const hasTotal = total != null && total > 0
  const pct = hasTotal ? Math.min(count / total, 1) : null

  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <div className="flex items-center justify-between text-xs text-slate-600 gap-2">
        <span className="font-medium">{formatCount(count)} docs</span>
        {hasTotal && (
          <span className="text-slate-400">
            {pct! >= 1 ? '100%' : `${Math.floor(pct! * 100)}%`}
            <span className="text-slate-300 mx-0.5">/</span>
            {formatCount(total)}
          </span>
        )}
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        {hasTotal ? (
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isRunning ? 'bg-blue-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.max(pct! * 100, pct! > 0 ? 2 : 0)}%` }}
          />
        ) : (
          <div
            className={`h-full rounded-full transition-all ${
              isRunning ? 'bg-blue-500 w-full animate-pulse' : 'bg-green-500 w-full'
            }`}
          />
        )}
      </div>
    </div>
  )
}
