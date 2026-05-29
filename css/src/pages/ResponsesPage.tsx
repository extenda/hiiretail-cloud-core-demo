import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'
import { SelectInput } from '../components/SelectInput'
import { Pagination } from '../components/Pagination'
import { ResponseModal } from '../components/ResponseModal'
import { useSurveyById } from '../hooks/useSurveyById'
import {
  useSurveyResponses,
  type ResponseSearchFilters,
} from '../hooks/useSurveyResponses'
import { formatDateTime } from '../lib/format'
import type { ResponseStatus, SurveyResponseDto } from '../api/client'

const STATUS_OPTIONS: { value: ResponseStatus; label: string }[] = [
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DISMISSED', label: 'Dismissed' },
  { value: 'ABANDONED', label: 'Abandoned' },
  { value: 'IGNORED', label: 'Ignored' },
]

export function ResponsesPage() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const [filters, setFilters] = useState<ResponseSearchFilters>({ skip: 0, take: 50 })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const surveyQuery = useSurveyById(surveyId ?? null)
  const responsesQuery = useSurveyResponses(surveyId, filters)

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status: (status as ResponseStatus) || '', skip: 0 }))
  }

  const handlePageChange = (skip: number) => setFilters((prev) => ({ ...prev, skip }))

  return (
    <div className="space-y-4">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to surveys
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">
          Responses
          {surveyQuery.data && (
            <span className="font-normal text-slate-500"> · {surveyQuery.data.name}</span>
          )}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <SelectInput
          label="Status"
          className="w-48"
          options={STATUS_OPTIONS}
          value={filters.status ?? ''}
          onChange={(e) => handleStatusChange(e.target.value)}
        />
        {responsesQuery.isFetching && (
          <svg className="ml-1 mt-4 h-4 w-4 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </div>

      {responsesQuery.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
          <span className="font-medium">Error:</span> {String(responsesQuery.error)}
        </div>
      )}

      {responsesQuery.data && (
        <ResponseTable
          items={responsesQuery.data.items}
          page={responsesQuery.data.page}
          onPageChange={handlePageChange}
          onSelect={(r) => setSelectedId(r.responseId)}
        />
      )}

      {surveyId && selectedId && (
        <ResponseModal
          surveyId={surveyId}
          responseId={selectedId}
          onClose={() => {
            setSelectedId(null)
            void responsesQuery.refetch()
          }}
        />
      )}
    </div>
  )
}

function ResponseTable({
  items,
  page,
  onPageChange,
  onSelect,
}: {
  items: SurveyResponseDto[]
  page: { skip: number; take: number; hasMore: boolean }
  onPageChange: (skip: number) => void
  onSelect: (response: SurveyResponseDto) => void
}) {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Th>Response</Th>
              <Th>Status</Th>
              <Th>Business unit</Th>
              <Th>Product</Th>
              <Th>Created</Th>
              <Th>Updated</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  No responses found
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr
                  key={r.responseId}
                  onClick={() => onSelect(r)}
                  className="cursor-pointer transition-colors hover:bg-indigo-50/50"
                >
                  <td className="whitespace-nowrap px-3 py-2 align-top font-mono text-xs text-slate-600">
                    {r.responseId.slice(0, 8)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-top">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-top text-slate-700">
                    {r.businessUnitId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-top">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">
                      {r.product}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-top text-slate-600">
                    {formatDateTime(r.createdAt) ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-top text-slate-600">
                    {formatDateTime(r.updatedAt) ?? <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} onPageChange={onPageChange} />
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  )
}
