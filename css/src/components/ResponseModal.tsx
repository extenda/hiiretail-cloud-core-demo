import { FillRunner } from './FillRunner'
import { useResponseById } from '../hooks/useResponseById'
import { parseAnswers } from '../lib/fillModel'
import type { ResponseContextDto } from '../api/client'

interface Props {
  surveyId: string
  responseId: string
  onClose: () => void
}

export function ResponseModal({ surveyId, responseId, onClose }: Props) {
  const query = useResponseById(surveyId, responseId)
  const response = query.data

  const context: ResponseContextDto | null = response
    ? {
        businessUnitId: response.businessUnitId,
        product: response.product,
        workstationId: response.workstationId,
        transactionRef: response.transactionRef,
      }
    : null

  const readOnly = response ? response.status !== 'IN_PROGRESS' : true

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-6">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {readOnly ? 'View response' : 'Edit response'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {query.isLoading && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
              <svg className="h-5 w-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading response…
            </div>
          )}

          {query.error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-medium">Error:</span> {String(query.error)}
            </div>
          )}

          {response && context && (
            <FillRunner
              key={responseId}
              variant="modal"
              surveyId={surveyId}
              responseId={responseId}
              context={context}
              status={response.status}
              readOnly={readOnly}
              initialAnswers={parseAnswers(response.answers)}
              onExit={onClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}
