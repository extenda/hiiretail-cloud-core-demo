import { useHighlight } from './useHighlight'

interface Props {
  title?: string
  dot?: boolean
  className?: string
}

export function NewBadge({ title = 'New in this release', dot = false, className = '' }: Props) {
  const { enabled } = useHighlight()
  if (!enabled) return null

  if (dot) {
    return (
      <span
        title={title}
        className={`inline-block h-2 w-2 shrink-0 rounded-full bg-brand-500 ring-2 ring-brand-100 ${className}`}
      />
    )
  }

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full bg-brand-100 px-1.5 py-px align-middle text-[10px] font-semibold uppercase tracking-wide text-brand-700 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
      new
    </span>
  )
}
