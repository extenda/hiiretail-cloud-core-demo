import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMonitorData } from '../api/client'
import { JobTable } from '../components/JobTable'
import { PubsubJobForm } from '../components/PubsubJobForm'

const REFETCH_INTERVAL_MS = 30_000

export function PubsubPage() {
  const [showForm, setShowForm] = useState(false)
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

  // Only show rows where the execution has JOB_TYPE=pubsub, or progress-only rows
  // whose backing index matches the data-stream alias (no execution linked).
  const allMatched = data?.matched ?? []
  const pubsubRows = allMatched.filter((r) => {
    if (r.execution) {
      const jobType = r.execution.container?.env.find((e) => e.name === 'JOB_TYPE')?.value
      return jobType === 'pubsub'
    }
    // Progress-only rows without an execution: can't determine job type,
    // exclude them to avoid noise (they'll appear on the reindex tab).
    return false
  })

  const runningCount = pubsubRows.filter(
    (r) => r.execution?.status === 'RUNNING' || r.progress?.status === 'running',
  ).length

  return (
    <div>
      {/* Stats bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4">
          <StatCard label="Total Jobs" value={pubsubRows.length} />
          <StatCard label="Running" value={runningCount} highlight={runningCount > 0} />
        </div>

        <div className="flex items-center gap-3">
          {dataUpdatedAt > 0 && (
            <span className="text-xs text-slate-400">
              Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
            </span>
          )}

          <button
            onClick={() => setShowForm((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showForm
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Start Job
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

      {/* Start Job form */}
      {showForm && (
        <div className="mb-6">
          <PubsubJobForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Content */}
      {isLoading && (
        <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
          <svg className="w-5 h-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-sm">Loading from GCP…</span>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-800 mb-1">Failed to load data</p>
          <p className="text-xs text-red-700 font-mono">{(error as Error).message}</p>
        </div>
      )}

      {data && (
        <>
          {pubsubRows.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-sm">
              No pub/sub republish jobs found. Use "Start Job" to trigger one.
            </div>
          ) : (
            <JobTable rows={pubsubRows} />
          )}
        </>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  highlight?: boolean
}

function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 min-w-[90px] ${
        highlight ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
      }`}
    >
      <p className={`text-2xl font-bold leading-none ${highlight ? 'text-blue-700' : 'text-slate-800'}`}>
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  )
}
