import { useNavigate } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'
import { Pagination } from './Pagination'
import { formatDateTime } from '../lib/format'
import type { SurveySummaryDto, PageInfoDto } from '../api/client'

interface Props {
  items: SurveySummaryDto[]
  page?: PageInfoDto
  onPageChange: (skip: number) => void
  onSelect: (survey: SurveySummaryDto) => void
}

export function SurveyTable({ items, page, onPageChange, onSelect }: Props) {
  const navigate = useNavigate()
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>Targets</Th>
              <Th>Start</Th>
              <Th>End</Th>
              <Th>{''}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  No surveys found
                </td>
              </tr>
            ) : (
              items.map((survey) => (
                <tr
                  key={survey.surveyId}
                  onClick={() => onSelect(survey)}
                  className="cursor-pointer transition-colors hover:bg-indigo-50/50"
                >
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium text-slate-800">
                      {survey.name || survey.surveyId}
                    </div>
                    {survey.description && (
                      <div className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                        {survey.description}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-top">
                    <StatusBadge status={survey.status} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <TargetPills targets={survey.targets} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-top text-slate-600">
                    {formatDateTime(survey.startsAt) ?? <Dash />}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-top text-slate-600">
                    {formatDateTime(survey.endsAt) ?? (
                      <span className="text-xs italic text-slate-400">Open-ended</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right align-top">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/surveys/${survey.surveyId}/responses`)
                      }}
                      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-700"
                    >
                      Responses
                    </button>
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

function Dash() {
  return <span className="text-slate-300">—</span>
}

function TargetPills({ targets }: { targets: string[] | undefined }) {
  if (!targets || targets.length === 0) {
    return <Dash />
  }
  return (
    <div className="flex flex-wrap gap-1">
      {targets.map((target) => (
        <span
          key={target}
          className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600"
        >
          {target}
        </span>
      ))}
    </div>
  )
}
