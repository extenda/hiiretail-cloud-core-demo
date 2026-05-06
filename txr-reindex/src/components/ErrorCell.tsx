import { useState } from 'react'

interface ErrorCellProps {
  message: string | null
}

const TRUNCATE_AT = 120

export function ErrorCell({ message }: ErrorCellProps) {
  const [expanded, setExpanded] = useState(false)

  if (!message) return <span className="text-slate-400">—</span>

  const isLong = message.length > TRUNCATE_AT
  const displayed =
    expanded || !isLong ? message : `${message.slice(0, TRUNCATE_AT)}…`

  return (
    <div className="max-w-xs">
      <p className="text-xs text-red-700 font-mono break-words whitespace-pre-wrap">
        {displayed}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-indigo-600 hover:underline mt-0.5"
        >
          {expanded ? 'show less' : 'show more'}
        </button>
      )}
    </div>
  )
}
