import { Fragment, useState } from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  selectedKey?: string | null
  getRowKey: (row: T) => string
  expandedRender?: (row: T) => React.ReactNode
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  selectedKey,
  getRowKey,
  expandedRender,
}: Props<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleExpand = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
        No results found
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {expandedRender && <th className="w-8 px-2 py-2" />}
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((row) => {
            const key = getRowKey(row)
            const isSelected = selectedKey === key
            const isExpanded = expandedRows.has(key)
            return (
              <Fragment key={key}>
                <tr
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${
                    isSelected
                      ? 'bg-indigo-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {expandedRender && (
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpand(key)
                        }}
                        className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <svg
                          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-3 py-2 text-slate-700">
                      {col.render
                        ? col.render(row)
                        : renderCellValue((row as Record<string, unknown>)[col.key])}
                    </td>
                  ))}
                </tr>
                {expandedRender && isExpanded && (
                  <tr key={`${key}-expanded`} className="bg-slate-50/50">
                    <td colSpan={columns.length + 1} className="px-4 py-3">
                      {expandedRender(row)}
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function renderCellValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-slate-300">—</span>
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-300">—</span>
    if (typeof value[0] === 'string') return value.join(', ')
    return `[${value.length} items]`
  }
  if (typeof value === 'object') return <ObjectInline obj={value as Record<string, unknown>} />
  return String(value)
}

function ObjectInline({ obj }: { obj: Record<string, unknown> }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
      {Object.entries(obj).map(([k, v]) => (
        <span key={k}>
          <span className="font-medium text-slate-500">{k}:</span>{' '}
          <span className="text-slate-700">{renderCellValue(v)}</span>
        </span>
      ))}
    </div>
  )
}

export { renderCellValue }
