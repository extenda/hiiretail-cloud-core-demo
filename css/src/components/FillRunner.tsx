import { useEffect, useMemo, useRef, useState } from 'react'
import { QuestionField, type SaveStatus } from './QuestionField'
import { StatusBadge } from './StatusBadge'
import { useSurveyById } from '../hooks/useSurveyById'
import {
  normalizeQuestions,
  isQuestionVisible,
  isAnswered,
  type AnswerValue,
} from '../lib/fillModel'
import {
  createResponse,
  upsertAnswer,
  deleteAnswer,
  completeResponse,
} from '../api/client'
import type { ResponseContextDto, ResponseStatus } from '../api/client'

interface Props {
  surveyId: string
  context: ResponseContextDto
  onExit: () => void
  /** When provided, operate on an existing response instead of creating a new shell. */
  responseId?: string
  /** Seed answers (used when editing/viewing an existing response). */
  initialAnswers?: Record<string, AnswerValue>
  /** Disable editing and submission (terminal responses). */
  readOnly?: boolean
  /** Current response status, shown as a badge. */
  status?: ResponseStatus
  /** Layout mode — 'modal' drops the page chrome (back button / centering). */
  variant?: 'page' | 'modal'
}

type CompleteState = 'idle' | 'completing' | 'done' | 'error'

export function FillRunner({
  surveyId,
  context,
  onExit,
  responseId: responseIdProp,
  initialAnswers,
  readOnly = false,
  status,
  variant = 'page',
}: Props) {
  const surveyQuery = useSurveyById(surveyId)
  const isExisting = !!responseIdProp
  const isModal = variant === 'modal'

  const [responseId] = useState(() => responseIdProp ?? crypto.randomUUID())
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() => initialAnswers ?? {})
  const [saveState, setSaveState] = useState<Record<string, SaveStatus>>({})
  const [completeState, setCompleteState] = useState<CompleteState>('idle')
  const [completeError, setCompleteError] = useState<string | null>(null)

  const shellStarted = useRef(false)

  const questions = useMemo(
    () => (surveyQuery.data ? normalizeQuestions(surveyQuery.data.questions) : []),
    [surveyQuery.data],
  )

  // Create the response shell once the definition is loaded (new responses only).
  useEffect(() => {
    if (isExisting || readOnly || !surveyQuery.data || shellStarted.current) return
    shellStarted.current = true
    void createResponse({ path: { surveyId, responseId }, body: { context } })
  }, [isExisting, readOnly, surveyQuery.data, surveyId, responseId, context])

  const persist = async (questionId: string, value: AnswerValue | undefined) => {
    setSaveState((s) => ({ ...s, [questionId]: 'saving' }))
    try {
      const res =
        value === undefined
          ? await deleteAnswer({ path: { surveyId, responseId, questionId } })
          : await upsertAnswer({
              path: { surveyId, responseId, questionId },
              body: { context, answer: value },
            })
      if (res.error) throw new Error(JSON.stringify(res.error))
      setSaveState((s) => ({ ...s, [questionId]: value === undefined ? 'idle' : 'saved' }))
    } catch {
      setSaveState((s) => ({ ...s, [questionId]: 'error' }))
    }
  }

  const handleLocalChange = (questionId: string, value: AnswerValue | undefined) => {
    if (readOnly) return
    setAnswers((prev) => {
      const next = { ...prev }
      if (value === undefined) delete next[questionId]
      else next[questionId] = value
      return next
    })
  }

  const handleCommit = (questionId: string, value: AnswerValue | undefined) => {
    if (readOnly) return
    // Apply the change, then drop any answers that are now hidden by a condition.
    const next = { ...answers }
    if (value === undefined) delete next[questionId]
    else next[questionId] = value

    const removed: string[] = []
    let changed = true
    while (changed) {
      changed = false
      for (const q of questions) {
        if (next[q.questionId] !== undefined && !isQuestionVisible(q, next)) {
          delete next[q.questionId]
          removed.push(q.questionId)
          changed = true
        }
      }
    }

    setAnswers(next)
    if (removed.length > 0) {
      setSaveState((s) => {
        const copy = { ...s }
        for (const id of removed) copy[id] = 'idle'
        return copy
      })
    }

    void persist(questionId, value)
    for (const id of removed) {
      void deleteAnswer({ path: { surveyId, responseId, questionId: id } })
    }
  }

  const visibleQuestions = questions.filter((q) => isQuestionVisible(q, answers))
  const missingMandatory = visibleQuestions.filter(
    (q) => q.mandatory && !isAnswered(answers[q.questionId]),
  )
  const canComplete = missingMandatory.length === 0 && completeState !== 'completing'

  const handleComplete = async () => {
    setCompleteState('completing')
    setCompleteError(null)
    try {
      const res = await completeResponse({ path: { surveyId, responseId }, body: { context } })
      if (res.error) throw new Error(JSON.stringify(res.error))
      setCompleteState('done')
    } catch (err) {
      setCompleteError(err instanceof Error ? err.message : String(err))
      setCompleteState('error')
    }
  }

  const outer = isModal ? 'space-y-4' : 'mx-auto max-w-2xl space-y-4'

  if (surveyQuery.isLoading) {
    return (
      <div className={isModal ? '' : 'mx-auto max-w-2xl'}>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
          <Spinner /> Loading survey…
        </div>
      </div>
    )
  }

  if (surveyQuery.error || !surveyQuery.data) {
    return (
      <div className={outer}>
        {!isModal && <BackButton onClick={onExit} />}
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
          <span className="font-medium">Error:</span>{' '}
          {surveyQuery.error ? String(surveyQuery.error) : 'Survey not found.'}
        </div>
      </div>
    )
  }

  const survey = surveyQuery.data

  if (completeState === 'done') {
    return (
      <div className={isModal ? '' : 'mx-auto max-w-2xl'}>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Response submitted</h2>
          <p className="mt-1 text-sm text-slate-500">
            Thanks! Your answers for “{survey.name}” were recorded.
          </p>
          <button
            type="button"
            onClick={onExit}
            className="mt-5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            {isModal ? 'Close' : 'Back to surveys'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={outer}>
      {!isModal && <BackButton onClick={onExit} />}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{survey.name}</h2>
          {status && <StatusBadge status={status} />}
        </div>
        {survey.description && (
          <p className="mt-1 text-sm text-slate-500">{survey.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <Chip>{context.businessUnitId}</Chip>
          <Chip>{context.product}</Chip>
          {context.workstationId && <Chip>{context.workstationId}</Chip>}
          <span className="text-slate-400">
            Response <code className="font-mono">{responseId.slice(0, 8)}</code>
          </span>
        </div>
        {readOnly && (
          <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            This response is {labelForStatus(status)} and can no longer be edited.
          </p>
        )}
      </div>

      <div className="space-y-4">
        {visibleQuestions.map((q, i) => (
          <QuestionField
            key={q.questionId}
            question={q}
            index={i}
            value={answers[q.questionId]}
            status={saveState[q.questionId] ?? 'idle'}
            readOnly={readOnly}
            onLocalChange={(v) => handleLocalChange(q.questionId, v)}
            onCommit={(v) => handleCommit(q.questionId, v)}
          />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {completeState === 'error' && completeError && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {completeError}
          </div>
        )}
        {readOnly ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onExit}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {missingMandatory.length > 0
                ? `${missingMandatory.length} required question${
                    missingMandatory.length === 1 ? '' : 's'
                  } still to answer`
                : 'All required questions answered'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExit}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                {isExisting ? 'Close' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={!canComplete}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {completeState === 'completing' && <Spinner />}
                {completeState === 'completing' ? 'Submitting…' : 'Submit response'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function labelForStatus(status: ResponseStatus | undefined): string {
  switch (status) {
    case 'COMPLETED':
      return 'completed'
    case 'DISMISSED':
      return 'dismissed'
    case 'ABANDONED':
      return 'abandoned'
    case 'IGNORED':
      return 'ignored'
    default:
      return 'closed'
  }
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back to surveys
    </button>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-slate-700">
      {children}
    </span>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-current" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
