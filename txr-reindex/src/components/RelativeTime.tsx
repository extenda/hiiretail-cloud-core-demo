interface RelativeTimeProps {
  iso: string | undefined
  label?: string
}

function formatRelative(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return iso

  const diffMs = Date.now() - date.getTime()
  const abs = Math.abs(diffMs)

  if (abs < 60_000) return 'just now'
  if (abs < 3_600_000) {
    const m = Math.round(abs / 60_000)
    return `${m}m ago`
  }
  if (abs < 86_400_000) {
    const h = Math.round(abs / 3_600_000)
    return `${h}h ago`
  }
  const d = Math.round(abs / 86_400_000)
  return `${d}d ago`
}

export function RelativeTime({ iso, label }: RelativeTimeProps) {
  if (!iso) return <span className="text-slate-400">—</span>

  return (
    <span
      className="text-slate-600 text-xs"
      title={new Date(iso).toLocaleString()}
    >
      {label && (
        <span className="text-slate-400 mr-1">{label}</span>
      )}
      {formatRelative(iso)}
    </span>
  )
}
