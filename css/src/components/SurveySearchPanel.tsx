import { useState } from 'react'
import type { SurveySearchFilters } from '../hooks/useSurveySearch'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'RUNNING', label: 'Running' },
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'MANUALLY_DISABLED', label: 'Disabled' },
  { value: 'ENDED', label: 'Ended' },
]

interface Props {
  onSearch: (filters: SurveySearchFilters) => void
  isLoading: boolean
  onCreateClick: () => void
}

export function SurveySearchPanel({ onSearch, isLoading, onCreateClick }: Props) {
  const [status, setStatus] = useState<SurveySearchFilters['status']>('')

  const apply = (next: SurveySearchFilters['status']) => {
    setStatus(next)
    onSearch({ status: next, skip: 0, take: 50 })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center gap-1.5">
        <svg
          className="h-4 w-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M10 20h4" />
        </svg>
        <label htmlFor="status-filter" className="text-xs font-medium text-slate-500">
          Status
        </label>
      </div>
      <select
        id="status-filter"
        value={status ?? ''}
        onChange={(e) => apply(e.target.value as SurveySearchFilters['status'])}
        disabled={isLoading}
        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {status && (
        <button
          type="button"
          onClick={() => apply('')}
          className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          Clear
        </button>
      )}

      {isLoading && (
        <svg className="h-4 w-4 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}

      <div className="flex-1" />

      <button
        type="button"
        onClick={onCreateClick}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
      >
        + Create Survey
      </button>
    </div>
  )
}
