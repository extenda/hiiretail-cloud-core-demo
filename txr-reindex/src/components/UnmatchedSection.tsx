import type { MatchedJob } from '../api/types'
import { StatusBadge } from './StatusBadge'
import { RelativeTime } from './RelativeTime'

interface UnmatchedSectionProps {
  rows: MatchedJob[]
}

export function UnmatchedSection({ rows }: UnmatchedSectionProps) {
  if (rows.length === 0) return null

  const orphanExecutions = rows.filter((r) => r.execution && !r.progress)
  const orphanProgress = rows.filter((r) => !r.execution && r.progress)

  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
        Unmatched Entries
      </h2>

      {orphanExecutions.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-slate-500 mb-2">
            Executions without a Spanner record
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Execution
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Backing Index (env)
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {orphanExecutions.map((row, i) => {
                  const ex = row.execution!
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <a
                          href={ex.consoleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline font-mono text-xs"
                        >
                          {ex.name}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ex.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {ex.backingIndexId ?? (
                          <span className="text-slate-400 italic">not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <RelativeTime iso={ex.createTime} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {orphanProgress.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-slate-500 mb-2">
            Spanner records without a Cloud Run execution
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Backing Index
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Processed
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {orphanProgress.map((row, i) => {
                  const p = row.progress!
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {p.jobId}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {p.backingIndex}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        {p.processedCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <RelativeTime iso={p.startedAt} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
