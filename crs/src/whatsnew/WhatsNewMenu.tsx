import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CHANGES } from './changes'
import { useHighlight } from './useHighlight'

export function WhatsNewMenu() {
  const { enabled, setEnabled } = useHighlight()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)

    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium ${
          open
            ? 'border-brand-500 bg-brand-100 text-brand-700'
            : 'border-brand-500/40 text-brand-700 hover:bg-brand-100'
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-brand-500" />
        What's new
        <span className="rounded-full bg-brand-500 px-1.5 text-[10px] font-semibold text-white">
          {CHANGES.length}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-96 rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">What's new in CRS</h3>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="rounded border-slate-300"
              />
              Highlight in UI
            </label>
          </div>
          <ol className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
            {CHANGES.map((change, idx) => (
              <li key={change.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{change.title}</p>
                      {change.to && (
                        <Link
                          to={change.to}
                          onClick={() => setOpen(false)}
                          className="shrink-0 text-xs font-medium text-indigo-600 hover:underline"
                        >
                          Open
                        </Link>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{change.summary}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{change.where}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
