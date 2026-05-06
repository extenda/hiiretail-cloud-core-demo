import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMonitorData } from '../api/client'
import { JobTable } from '../components/JobTable'
import { UnmatchedSection } from '../components/UnmatchedSection'
import { RunJobForm } from '../components/RunJobForm'

const REFETCH_INTERVAL_MS = 30_000

export function MonitorPage() {
  const [showRunForm, setShowRunForm] = useState(false)
  const {
    data,
    isLoading,
    isError,
    error,
    dataUpdatedAt,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['monitor'],
    queryFn: fetchMonitorData,
    refetchInterval: REFETCH_INTERVAL_MS,
  })

  const matched = data?.matched ?? []
  const pairedRows = matched.filter((r) => r.execution && r.progress)
  const unmatchedRows = matched.filter((r) => !r.execution || !r.progress)
  const runningCount = pairedRows.filter(
    (r) => r.execution?.status === 'RUNNING' || r.progress?.status === 'running',
  ).length

  return (
    <div>
      {/* Stats bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4">
          <StatCard label="Total Jobs" value={matched.length} />
          <StatCard
            label="Running"
            value={runningCount}
            highlight={runningCount > 0}
          />
          <StatCard
            label="Unmatched"
            value={unmatchedRows.length}
            warn={unmatchedRows.length > 0}
          />
        </div>

        <div className="flex items-center gap-3">
          {dataUpdatedAt > 0 && (
            <span className="text-xs text-slate-400">
              Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => setShowRunForm((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showRunForm
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Run Job
          </button>

          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Run Job form */}
      {showRunForm && (
        <div className="mb-6">
          <RunJobForm onClose={() => setShowRunForm(false)} />
        </div>
      )}

      {/* Content */}
      {isLoading && (
        <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
          <svg
            className="w-5 h-5 animate-spin text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="text-sm">Loading from GCP…</span>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-800 mb-1">
            Failed to load data
          </p>
          <p className="text-xs text-red-700 font-mono">
            {(error as Error).message}
          </p>
          <p className="text-xs text-red-500 mt-2">
            Make sure you have run{' '}
            <code className="bg-red-100 px-1 rounded">
              gcloud auth application-default login
            </code>{' '}
            and have access to the <code className="bg-red-100 px-1 rounded">cloud-core-prod-2d76</code> project.
          </p>
        </div>
      )}

      {data && (
        <>
          <JobTable rows={pairedRows} />
          <UnmatchedSection rows={unmatchedRows} />
        </>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  highlight?: boolean
  warn?: boolean
}

function StatCard({ label, value, highlight, warn }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 min-w-[90px] ${
        highlight
          ? 'bg-blue-50 border-blue-200'
          : warn && value > 0
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-slate-200'
      }`}
    >
      <p
        className={`text-2xl font-bold leading-none ${
          highlight ? 'text-blue-700' : warn && value > 0 ? 'text-amber-700' : 'text-slate-800'
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  )
}
