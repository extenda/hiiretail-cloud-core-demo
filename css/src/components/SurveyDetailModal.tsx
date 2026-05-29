import { SurveyForm } from './SurveyForm'
import { useSurveyById } from '../hooks/useSurveyById'

interface Props {
  surveyId: string
  onClose: () => void
}

export function SurveyDetailModal({ surveyId, onClose }: Props) {
  const query = useSurveyById(surveyId)

  if (query.data) {
    return (
      <SurveyForm
        key={surveyId}
        open
        readOnly
        survey={query.data}
        onClose={onClose}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-16 pb-8">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Survey details</h2>
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
        <div className="px-6 py-8">
          {query.isLoading ? (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <svg className="h-5 w-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading survey...
            </div>
          ) : (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-medium">Error:</span> {String(query.error)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
