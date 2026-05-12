import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CloudRunExecution, ContainerInfo, JobProgress, LogEntry, MatchedJob } from '../api/types'
import { fetchLogs, triggerExecution } from '../api/client'
import { StatusBadge } from './StatusBadge'
import { ProgressBar } from './ProgressBar'
import { RelativeTime } from './RelativeTime'
import { ErrorCell } from './ErrorCell'

interface JobTableProps {
  rows: MatchedJob[]
}

export function JobTable({ rows }: JobTableProps) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        No jobs found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {/* chevron column */}
            <th className="w-8 px-3 py-3" />
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Execution
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              CRJ Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Backing Index
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Spanner Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Started
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Last Update
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Error
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, i) => (
            <JobRow key={i} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function JobRow({ row }: { row: MatchedJob }) {
  const { execution: ex, progress: p } = row
  const [expanded, setExpanded] = useState(false)
  const isRunning = ex?.status === 'RUNNING' || p?.status === 'running'
  const hasDetail = Boolean(ex?.container || p?.jobId)

  const backingIndexId =
    p?.backingIndex ??
    ex?.backingIndexId ??
    ex?.container?.env.find((e) => e.name === 'BACKING_INDEX_ID')?.value ??
    undefined
  const tenantId   = ex?.container?.env.find((e) => e.name === 'TENANT_ID')?.value   ?? undefined
  const jobType    = ex?.container?.env.find((e) => e.name === 'JOB_TYPE')?.value    ?? undefined
  const dateRange  = ex?.container?.env.find((e) => e.name === 'DATE_RANGE')?.value  ?? undefined
  const jobId = p?.jobId

  return (
    <>
      <tr
        className={`transition-colors ${hasDetail ? 'cursor-pointer hover:bg-slate-50' : ''} ${expanded ? 'bg-slate-50' : ''}`}
        onClick={() => hasDetail && setExpanded((v) => !v)}
      >
        {/* Chevron */}
        <td className="w-8 px-3 py-3 text-slate-400">
          {hasDetail && (
            <svg
              className={`w-4 h-4 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </td>

        {/* Execution name */}
        <td className="px-4 py-3">
          {ex ? (
            <a
              href={ex.consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-indigo-600 hover:text-indigo-800 hover:underline font-mono text-xs truncate max-w-[220px] block"
              title={ex.name}
            >
              {ex.name}
            </a>
          ) : (
            <span className="text-slate-400 text-xs italic">no execution</span>
          )}
        </td>

        {/* CRJ status */}
        <td className="px-4 py-3">
          {ex ? (
            <StatusBadge status={ex.status} />
          ) : (
            <span className="text-slate-300 text-xs">—</span>
          )}
        </td>

        {/* Backing index */}
        <td className="px-4 py-3">
          <span
            className="font-mono text-xs text-slate-700 truncate max-w-[240px] block"
            title={p?.backingIndex ?? ex?.backingIndexId}
          >
            {p?.backingIndex ?? ex?.backingIndexId ?? (
              <span className="text-slate-400">—</span>
            )}
          </span>
        </td>

        {/* Spanner status */}
        <td className="px-4 py-3">
          {p ? (
            <StatusBadge status={p.status} />
          ) : (
            <span className="text-slate-300 text-xs">—</span>
          )}
        </td>

        {/* Progress */}
        <td className="px-4 py-3">
          {p ? (
            <ProgressBar count={p.processedCount} total={p.expectedCount} isRunning={isRunning} />
          ) : (
            <span className="text-slate-300 text-xs">—</span>
          )}
        </td>

        {/* Started */}
        <td className="px-4 py-3">
          <RelativeTime iso={p?.startedAt ?? ex?.createTime} />
        </td>

        {/* Last update */}
        <td className="px-4 py-3">
          <RelativeTime iso={p?.updatedAt ?? ex?.completionTime} />
        </td>

        {/* Error */}
        <td className="px-4 py-3">
          <ErrorCell message={p?.error ?? null} />
        </td>

        {/* Actions */}
        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
          {backingIndexId && (
            <RestartButton
              backingIndexId={backingIndexId}
              tenantId={tenantId}
              jobId={jobId}
              jobType={jobType}
              dateRange={dateRange}
            />
          )}
        </td>
      </tr>

      {expanded && hasDetail && (
        <tr>
          <td colSpan={10} className="bg-slate-50 border-b border-slate-200 px-6 py-5">
            <ExecutionDetail execution={ex ?? undefined} progress={p ?? undefined} />
          </td>
        </tr>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Restart button
// ---------------------------------------------------------------------------

interface RestartButtonProps {
  backingIndexId: string
  tenantId?: string
  jobId?: string
  jobType?: string
  dateRange?: string
}

function RestartButton({ backingIndexId, tenantId, jobId, jobType, dateRange }: RestartButtonProps) {
  const queryClient = useQueryClient()
  const [flash, setFlash] = useState<'success' | 'error' | null>(null)

  const mutation = useMutation({
    mutationFn: () => triggerExecution(backingIndexId, tenantId, jobId, jobType, dateRange),
    onSuccess: () => {
      setFlash('success')
      void queryClient.invalidateQueries({ queryKey: ['monitor'] })
      setTimeout(() => setFlash(null), 3000)
    },
    onError: () => {
      setFlash('error')
      setTimeout(() => setFlash(null), 4000)
    },
  })

  if (flash === 'success') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Started
      </span>
    )
  }

  if (flash === 'error') {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs text-red-500 font-medium"
        title={(mutation.error as Error)?.message}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Failed
      </span>
    )
  }

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.status === 'pending'}
      title={[
        `Backing index: ${backingIndexId}`,
        jobType && `Job type: ${jobType}`,
        dateRange && `Date range: ${dateRange}`,
        tenantId && `Tenant: ${tenantId}`,
        jobId && `Job ID: ${jobId}`,
      ].filter(Boolean).join('\n')}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 transition-colors whitespace-nowrap"
    >
      {mutation.status === 'pending' ? (
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
      Restart
    </button>
  )
}

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------

interface ExecutionDetailProps {
  execution?: CloudRunExecution
  progress?: JobProgress
}

function ExecutionDetail({ execution, progress }: ExecutionDetailProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {execution?.container && (
          <>
            <ContainerSection container={execution.container} />
            <TaskSettingsSection container={execution.container} />
          </>
        )}
        {progress && <SpannerSection progress={progress} />}
      </div>
      {execution && <LogPanel executionName={execution.name} />}
    </div>
  )
}

function ContainerSection({ container }: { container: ContainerInfo }) {
  return (
    <div className="lg:col-span-1 space-y-3">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Container
      </h4>

      <DetailRow label="Image">
        <span className="font-mono text-xs text-slate-700 break-all">{container.image}</span>
      </DetailRow>

      {(container.cpu || container.memory) && (
        <DetailRow label="Resources">
          <span className="text-xs text-slate-700">
            {[container.cpu && `CPU: ${container.cpu}`, container.memory && `Mem: ${container.memory}`]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </DetailRow>
      )}

      {container.env.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1.5">Environment</p>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="min-w-full text-xs">
              <tbody className="divide-y divide-slate-100">
                {container.env.map((e, i) => (
                  <tr key={i} className="bg-white">
                    <td className="px-3 py-1.5 font-mono font-medium text-slate-600 whitespace-nowrap w-1/2">
                      {e.name}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-500 break-all">
                      {e.value !== null ? (
                        e.value || <span className="text-slate-300 italic">empty</span>
                      ) : (
                        <span className="text-amber-600 italic">[secret]</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskSettingsSection({ container }: { container: ContainerInfo }) {
  function formatTimeout(raw: string | null): string {
    if (!raw) return '—'
    const seconds = parseInt(raw.replace('s', ''), 10)
    if (isNaN(seconds)) return raw
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return [h && `${h}h`, m && `${m}m`, s && `${s}s`].filter(Boolean).join(' ') || raw
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Task Settings
      </h4>
      <DetailRow label="Task count">
        <span className="text-xs text-slate-700">{container.taskCount ?? '—'}</span>
      </DetailRow>
      <DetailRow label="Max retries">
        <span className="text-xs text-slate-700">{container.maxRetries ?? '—'}</span>
      </DetailRow>
      <DetailRow label="Timeout">
        <span className="text-xs text-slate-700">{formatTimeout(container.timeout)}</span>
      </DetailRow>
    </div>
  )
}

function SpannerSection({ progress }: { progress: JobProgress }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    void navigator.clipboard.writeText(progress.jobId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Spanner Record
      </h4>
      <DetailRow label="Job ID">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-700 break-all">{progress.jobId}</span>
          <button
            onClick={copy}
            title="Copy job ID"
            className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
        </div>
      </DetailRow>
      {progress.executionId && (
        <DetailRow label="Execution ID">
          <span className="font-mono text-xs text-slate-600">{progress.executionId}</span>
        </DetailRow>
      )}
      <DetailRow label="Backing index">
        <span className="font-mono text-xs text-slate-700 break-all">{progress.backingIndex}</span>
      </DetailRow>
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-400">{label}</span>
      <div>{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Log panel
// ---------------------------------------------------------------------------

const LEVEL_BADGE: Record<LogEntry['level'], string> = {
  ERROR: 'bg-red-900/60 text-red-300',
  WARN:  'bg-amber-900/60 text-amber-300',
  LOG:   'bg-indigo-900/60 text-indigo-300',
  DEBUG: 'bg-slate-700 text-slate-400',
  UNKNOWN: 'bg-slate-700 text-slate-500',
}

function formatLogTime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function LogPanel({ executionName }: { executionName: string }) {
  const { data: logs, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['logs', executionName],
    queryFn: () => fetchLogs(executionName),
    staleTime: 60_000,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Logs{logs ? ` (${logs.length})` : ''}
        </h4>
        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-500 disabled:opacity-40 transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reload
        </button>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900 overflow-hidden">
        {isLoading && (
          <div className="flex items-center gap-2 px-4 py-6 text-slate-400 text-xs">
            <svg className="w-4 h-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Fetching logs from Cloud Logging…
          </div>
        )}

        {isError && (
          <div className="px-4 py-4 text-red-400 text-xs font-mono">
            {(error as Error).message}
          </div>
        )}

        {logs && logs.length === 0 && (
          <div className="px-4 py-6 text-slate-500 text-xs text-center">
            No log entries found for this execution.
          </div>
        )}

        {logs && logs.length > 0 && (
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full text-xs font-mono">
              <tbody>
                {logs.map((entry, i) => (
                  <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="px-3 py-1 text-slate-500 whitespace-nowrap align-top w-20">
                      {formatLogTime(entry.timestamp)}
                    </td>
                    <td className="px-2 py-1 align-top w-16">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${LEVEL_BADGE[entry.level]}`}>
                        {entry.level === 'UNKNOWN' ? '···' : entry.level}
                      </span>
                    </td>
                    <td className="px-3 py-1 text-slate-300 break-all whitespace-pre-wrap align-top">
                      {entry.text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
