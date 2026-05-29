import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { TextField } from './TextField'
import { SelectInput } from './SelectInput'
import { StatusBadge } from './StatusBadge'
import { QuestionEditor } from './QuestionEditor'
import {
  buildConditionSources,
  createQuestionDraft,
  surveyToQuestionDrafts,
  type QuestionDraft,
} from './surveyDraft'
import { formatDateTime, isoToLocalInput } from '../lib/format'
import { createSurvey } from '../api/client'
import type { SurveyWriteDto, SurveyDto, UserType, Product } from '../api/client'

const QUESTION_ID_RE = /^[A-Za-z0-9_-]{1,64}$/

const USER_TYPE_OPTIONS: { value: UserType; label: string }[] = [
  { value: 'SHOPPER', label: 'Shopper' },
  { value: 'STAFF', label: 'Staff' },
]

const PRODUCTS: Product[] = ['Checkout App', 'Self Checkout', 'Hii Checkout Mobile']

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
  /** When provided, the form is pre-filled from this survey. */
  survey?: SurveyDto
  /** When true, all fields are disabled and the form is a read-only detail view. */
  readOnly?: boolean
}

export function SurveyForm({ open, onClose, onSaved, survey, readOnly = false }: Props) {
  const [name, setName] = useState(survey?.name ?? '')
  const [description, setDescription] = useState(survey?.description ?? '')
  const [userType, setUserType] = useState<UserType>(survey?.userType ?? 'SHOPPER')
  const [products, setProducts] = useState<Product[]>(survey?.products ?? [])
  const [targets, setTargets] = useState<string[]>(
    survey?.targets?.length ? survey.targets : ['tenants/self'],
  )
  const [startsAt, setStartsAt] = useState(isoToLocalInput(survey?.startsAt) || '')
  const [endsAt, setEndsAt] = useState(isoToLocalInput(survey?.endsAt) || '')
  const [sampleRate, setSampleRate] = useState(
    survey?.sampleRate != null ? String(survey.sampleRate) : '100',
  )
  const [disabledManually, setDisabledManually] = useState(survey?.disabledManually ?? false)
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    survey ? surveyToQuestionDrafts(survey.questions) : [createQuestionDraft()],
  )

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleProduct = (p: Product) =>
    setProducts((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))

  const updateQuestion = useCallback(
    (uid: string, next: QuestionDraft) =>
      setQuestions((prev) => prev.map((q) => (q.uid === uid ? next : q))),
    [],
  )

  const removeQuestion = useCallback(
    (uid: string) => setQuestions((prev) => prev.filter((q) => q.uid !== uid)),
    [],
  )

  const moveQuestion = useCallback(
    (uid: string, direction: -1 | 1) =>
      setQuestions((prev) => {
        const index = prev.findIndex((q) => q.uid === uid)
        if (index < 0) return prev
        const target = index + direction
        if (target < 0 || target >= prev.length) return prev
        const next = [...prev]
        const [moved] = next.splice(index, 1)
        next.splice(target, 0, moved)
        return next
      }),
    [],
  )

  const setTarget = (i: number, value: string) =>
    setTargets((prev) => prev.map((t, idx) => (idx === i ? value : t)))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (readOnly) return
    setError(null)

    const built = buildPayload({
      name,
      description,
      userType,
      products,
      targets,
      startsAt,
      endsAt,
      sampleRate,
      disabledManually,
      questions,
    })
    if ('error' in built) {
      setError(built.error)
      return
    }

    setSubmitting(true)
    try {
      await createSurvey({ body: built.payload, throwOnError: true })
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  // Recomputed only when the question set changes (not on unrelated state like name/dates),
  // so memoized QuestionEditors don't all re-render on every keystroke elsewhere.
  const conditionSources = useMemo(() => buildConditionSources(questions), [questions])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-6">
      <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {readOnly ? 'Survey details' : 'Create Survey'}
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

        {readOnly && survey && (
          <div className="shrink-0 border-b border-slate-100 bg-slate-50/60 px-6 py-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                Status <StatusBadge status={survey.status} />
              </span>
              <span>
                ID <code className="font-mono text-slate-700">{survey.surveyId}</code>
              </span>
              <span>
                Created {formatDateTime(survey.createdAt)} by{' '}
                <span className="text-slate-700">{survey.createdBy}</span>
              </span>
              <span>
                Updated {formatDateTime(survey.updatedAt)} by{' '}
                <span className="text-slate-700">{survey.updatedBy}</span>
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <fieldset disabled={readOnly} className="m-0 min-w-0 border-0 p-0">
          {/* Metadata */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Name *"
              className="sm:col-span-2"
              placeholder="Checkout satisfaction"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
              <textarea
                rows={2}
                placeholder="Short description shown to admins"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <SelectInput
              label="User type"
              options={USER_TYPE_OPTIONS}
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserType)}
              placeholder={false}
            />
            <TextField
              label="Sample rate (0–100)"
              type="number"
              min={0}
              max={100}
              value={sampleRate}
              onChange={(e) => setSampleRate(e.target.value)}
            />
            <TextField
              label="Starts at *"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
            <TextField
              label="Ends at"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </div>

          {/* Products */}
          <div className="mt-3">
            <p className="mb-1 text-xs font-medium text-slate-600">Products</p>
            <div className="flex flex-wrap gap-3">
              {PRODUCTS.map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={products.includes(p)}
                    onChange={() => toggleProduct(p)}
                    className="rounded border-slate-300"
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/* Targets */}
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-600">Targets (at least 1)</p>
              <button
                type="button"
                onClick={() => setTargets((prev) => [...prev, ''])}
                className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                + Add target
              </button>
            </div>
            <div className="space-y-2">
              {targets.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={t}
                    onChange={(e) => setTarget(i, e.target.value)}
                    placeholder="tenants/self"
                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setTargets((prev) => prev.filter((_, idx) => idx !== i))}
                    disabled={targets.length <= 1}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Remove target"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={disabledManually}
              onChange={(e) => setDisabledManually(e.target.checked)}
              className="rounded border-slate-300"
            />
            Disabled manually (survey will not run until re-enabled)
          </label>

          {/* Questions */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Questions</h3>
                <p className="text-xs text-slate-500">
                  Structural fields are immutable after creation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuestions((prev) => [...prev, createQuestionDraft()])}
                className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                + Add question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-500">
                No questions yet. Add at least one.
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionEditor
                    key={q.uid}
                    question={q}
                    index={i}
                    total={questions.length}
                    conditionSources={conditionSources}
                    onChange={updateQuestion}
                    onRemove={removeQuestion}
                    onMove={moveQuestion}
                  />
                ))}
              </div>
            )}
          </div>
          </fieldset>

          {error && !readOnly && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4">
            {readOnly ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Survey'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

interface BuildInput {
  name: string
  description: string
  userType: UserType
  products: Product[]
  targets: string[]
  startsAt: string
  endsAt: string
  sampleRate: string
  disabledManually: boolean
  questions: QuestionDraft[]
}

type BuildResult = { payload: SurveyWriteDto } | { error: string }

function buildPayload(input: BuildInput): BuildResult {
  if (!input.name.trim()) return { error: 'Name is required.' }
  if (!input.startsAt) return { error: 'Start date is required.' }

  const startsAtIso = new Date(input.startsAt).toISOString()
  let endsAtIso: string | undefined
  if (input.endsAt) {
    endsAtIso = new Date(input.endsAt).toISOString()
    if (new Date(endsAtIso) <= new Date(startsAtIso)) {
      return { error: 'End date must be after the start date.' }
    }
  }

  const rate = Number(input.sampleRate)
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    return { error: 'Sample rate must be between 0 and 100.' }
  }

  const cleanTargets = input.targets.map((t) => t.trim()).filter(Boolean)
  if (cleanTargets.length === 0) return { error: 'Add at least one target.' }

  if (input.questions.length === 0) return { error: 'Add at least one question.' }

  const seenIds = new Set<string>()
  const builtQuestions: unknown[] = []

  for (let i = 0; i < input.questions.length; i++) {
    const q = input.questions[i]
    const label = `Question ${i + 1}`
    const qid = q.questionId.trim()
    if (!QUESTION_ID_RE.test(qid)) {
      return { error: `${label}: Question ID must be 1–64 chars (letters, numbers, _ or -).` }
    }
    if (seenIds.has(qid)) return { error: `${label}: Duplicate question ID "${qid}".` }
    seenIds.add(qid)
    if (!q.text.trim()) return { error: `${label}: Question text is required.` }

    const base: Record<string, unknown> = {
      questionId: qid,
      text: q.text.trim(),
      inputType: q.kind,
      mandatory: q.mandatory,
    }

    if (q.condition.enabled) {
      const equals = q.condition.equals.split(',').map((v) => v.trim()).filter(Boolean)
      if (!q.condition.questionId) {
        return { error: `${label}: Pick the question the visibility condition depends on.` }
      }
      if (q.condition.questionId === qid || !seenIds.has(q.condition.questionId)) {
        return {
          error: `${label}: A visibility condition must reference an earlier question.`,
        }
      }
      if (equals.length === 0) {
        return { error: `${label}: Visibility condition needs at least one "equals" value.` }
      }
      base.condition = { questionId: q.condition.questionId, equals }
    }

    if (q.kind === 'TEXT') {
      if (q.maxLength.trim()) {
        const ml = Number(q.maxLength)
        if (!Number.isInteger(ml) || ml < 1 || ml > 4000) {
          return { error: `${label}: Max length must be between 1 and 4000.` }
        }
        base.maxLength = ml
      }
    }

    if (q.kind === 'SINGLE_SELECT' || q.kind === 'MULTI_SELECT') {
      const options = q.options
        .map((o) => ({ value: o.value.trim(), label: o.label.trim() }))
        .filter((o) => o.value || o.label)
      if (options.length < 2) return { error: `${label}: At least 2 options are required.` }
      if (options.some((o) => !o.value || !o.label)) {
        return { error: `${label}: Every option needs both a value and a label.` }
      }
      base.options = options

      if (q.kind === 'MULTI_SELECT') {
        const min = q.minSelections.trim() ? Number(q.minSelections) : undefined
        const max = q.maxSelections.trim() ? Number(q.maxSelections) : undefined
        if (min !== undefined) {
          if (!Number.isInteger(min) || min < 0) {
            return { error: `${label}: Min selections must be 0 or more.` }
          }
          base.minSelections = min
        }
        if (max !== undefined) {
          if (!Number.isInteger(max) || max < 1) {
            return { error: `${label}: Max selections must be 1 or more.` }
          }
          base.maxSelections = max
        }
        if (min !== undefined && max !== undefined && min > max) {
          return { error: `${label}: Min selections cannot exceed max selections.` }
        }
      }
    }

    if (q.kind === 'SLIDING_SCALE') {
      const min = Number(q.min)
      const max = Number(q.max)
      if (!Number.isInteger(min) || !Number.isInteger(max)) {
        return { error: `${label}: Scale min and max must be integers.` }
      }
      if (min >= max) return { error: `${label}: Scale min must be less than max.` }
      base.min = min
      base.max = max
      if (q.step.trim()) {
        const step = Number(q.step)
        if (!Number.isInteger(step) || step < 1) {
          return { error: `${label}: Step must be 1 or more.` }
        }
        base.step = step
      }
      if (q.minLabel.trim()) base.minLabel = q.minLabel.trim()
      if (q.maxLabel.trim()) base.maxLabel = q.maxLabel.trim()
    }

    builtQuestions.push(base)
  }

  const payload: SurveyWriteDto = {
    name: input.name.trim(),
    userType: input.userType,
    questions: builtQuestions as SurveyWriteDto['questions'],
    products: input.products,
    targets: cleanTargets,
    startsAt: startsAtIso,
    disabledManually: input.disabledManually,
    sampleRate: rate,
  }
  if (input.description.trim()) payload.description = input.description.trim()
  if (endsAtIso) payload.endsAt = endsAtIso

  return { payload }
}
