import { useState, useCallback } from 'react'
import { SurveySearchPanel } from '../components/SurveySearchPanel'
import { SurveyTable } from '../components/SurveyTable'
import { SurveyForm } from '../components/SurveyForm'
import { SurveyDetailModal } from '../components/SurveyDetailModal'
import { useSurveySearch, type SurveySearchFilters } from '../hooks/useSurveySearch'

export function SurveyListPage() {
  const [filters, setFilters] = useState<SurveySearchFilters>({ skip: 0, take: 50 })
  const [showCreate, setShowCreate] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const surveyQuery = useSurveySearch(filters)

  const handleSearch = useCallback((next: SurveySearchFilters) => {
    setFilters(next)
  }, [])

  const handlePageChange = useCallback((skip: number) => {
    setFilters((prev) => ({ ...prev, skip }))
  }, [])

  const handleCreated = useCallback(() => {
    surveyQuery.refetch()
  }, [surveyQuery])

  return (
    <div className="space-y-4">
      <SurveySearchPanel
        onSearch={handleSearch}
        isLoading={surveyQuery.isLoading}
        onCreateClick={() => setShowCreate(true)}
      />

      {surveyQuery.isLoading && <LoadingCard label="Loading surveys..." />}

      {surveyQuery.error && <ErrorCard message={String(surveyQuery.error)} />}

      {surveyQuery.data && (
        <div>
          <SectionHeader
            count={surveyQuery.data.items.length}
            hasMore={surveyQuery.data.page.hasMore}
          />
          <SurveyTable
            items={surveyQuery.data.items}
            page={surveyQuery.data.page}
            onPageChange={handlePageChange}
            onSelect={(survey) => setSelectedId(survey.surveyId)}
          />
        </div>
      )}

      <SurveyForm
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSaved={handleCreated}
      />

      {selectedId && (
        <SurveyDetailModal surveyId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
      <svg className="h-5 w-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label}
    </div>
  )
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
      <span className="font-medium">Error:</span> {message}
    </div>
  )
}

function SectionHeader({ count, hasMore }: { count: number; hasMore: boolean }) {
  return (
    <p className="mb-2 text-xs font-medium text-slate-500">
      Showing {count} {count === 1 ? 'survey' : 'surveys'}
      {hasMore && ' (more available)'}
    </p>
  )
}
