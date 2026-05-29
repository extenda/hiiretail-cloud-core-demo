import { memo, useMemo } from 'react'
import { TextField } from './TextField'
import { SelectInput } from './SelectInput'
import {
  QUESTION_KIND_OPTIONS,
  createQuestionDraft,
  type ConditionSource,
  type QuestionDraft,
  type QuestionKind,
  type OptionDraft,
} from './surveyDraft'

interface Props {
  question: QuestionDraft
  index: number
  total: number
  /** All questions (in order) as potential condition sources; only preceding ones are offered. */
  conditionSources: ConditionSource[]
  onChange: (uid: string, next: QuestionDraft) => void
  onRemove: (uid: string) => void
  onMove: (uid: string, direction: -1 | 1) => void
}

function QuestionEditorImpl({
  question,
  index,
  total,
  conditionSources,
  onChange,
  onRemove,
  onMove,
}: Props) {
  const set = <K extends keyof QuestionDraft>(key: K, value: QuestionDraft[K]) =>
    onChange(question.uid, { ...question, [key]: value })

  // Only questions defined before this one (with an id) can be referenced.
  const sources = useMemo(
    () => conditionSources.slice(0, index).filter((s) => s.questionId),
    [conditionSources, index],
  )
  const targets = sources.map((s) => ({ value: s.questionId, label: s.questionId }))
  const selectedSource = sources.find((s) => s.questionId === question.condition.questionId)
  const equalsValues = question.condition.equals
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

  const setEquals = (values: string[]) =>
    set('condition', { ...question.condition, equals: values.join(', ') })
  const toggleEquals = (value: string) =>
    setEquals(
      equalsValues.includes(value)
        ? equalsValues.filter((v) => v !== value)
        : [...equalsValues, value],
    )

  const handleKindChange = (kind: QuestionKind) => {
    // keep shared fields, reset to fresh defaults for the new kind
    const fresh = createQuestionDraft(kind)
    onChange(question.uid, {
      ...fresh,
      uid: question.uid,
      questionId: question.questionId,
      text: question.text,
      mandatory: question.mandatory,
      condition: question.condition,
    })
  }

  const setOption = (i: number, patch: Partial<OptionDraft>) => {
    const options = question.options.map((o, idx) => (idx === i ? { ...o, ...patch } : o))
    set('options', options)
  }

  const addOption = () => set('options', [...question.options, { value: '', label: '' }])
  const removeOption = (i: number) =>
    set('options', question.options.filter((_, idx) => idx !== i))

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-xs font-semibold text-indigo-700">
          {index + 1}
        </span>
        <span className="text-sm font-medium text-slate-700">Question</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => onMove(question.uid, -1)}
          disabled={index === 0}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
          title="Move up"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onMove(question.uid, 1)}
          disabled={index === total - 1}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
          title="Move down"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onRemove(question.uid)}
          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
          title="Remove question"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        <SelectInput
          label="Type"
          className="sm:col-span-3"
          options={QUESTION_KIND_OPTIONS}
          value={question.kind}
          onChange={(e) => handleKindChange(e.target.value as QuestionKind)}
          placeholder={false}
        />
        <TextField
          label="Question ID *"
          className="sm:col-span-4"
          placeholder="rating"
          value={question.questionId}
          onChange={(e) => set('questionId', e.target.value)}
        />
        <TextField
          label="Question text *"
          className="sm:col-span-5"
          placeholder="How was your experience today?"
          value={question.text}
          onChange={(e) => set('text', e.target.value)}
        />
      </div>

      {/* Type-specific fields */}
      {question.kind === 'TEXT' && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TextField
            label="Max length"
            type="number"
            min={1}
            max={4000}
            value={question.maxLength}
            onChange={(e) => set('maxLength', e.target.value)}
          />
        </div>
      )}

      {(question.kind === 'SINGLE_SELECT' || question.kind === 'MULTI_SELECT') && (
        <div className="mt-3 rounded-md border border-slate-100 bg-slate-50/60 p-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">Options (at least 2)</p>
            <button
              type="button"
              onClick={addOption}
              className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              + Add option
            </button>
          </div>
          <div className="space-y-2">
            {question.options.map((opt, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <TextField
                  label={i === 0 ? 'Value' : ''}
                  className="col-span-5"
                  placeholder="good"
                  value={opt.value}
                  onChange={(e) => setOption(i, { value: e.target.value })}
                />
                <TextField
                  label={i === 0 ? 'Label' : ''}
                  className="col-span-6"
                  placeholder="Good"
                  value={opt.label}
                  onChange={(e) => setOption(i, { label: e.target.value })}
                />
                <div className={`col-span-1 flex ${i === 0 ? 'items-end pb-1' : 'items-start'}`}>
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    disabled={question.options.length <= 2}
                    className="rounded p-1 text-slate-400 hover:bg-white hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Remove option"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {question.kind === 'MULTI_SELECT' && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <TextField
                label="Min selections"
                type="number"
                min={0}
                placeholder="0"
                value={question.minSelections}
                onChange={(e) => set('minSelections', e.target.value)}
              />
              <TextField
                label="Max selections"
                type="number"
                min={1}
                placeholder="(any)"
                value={question.maxSelections}
                onChange={(e) => set('maxSelections', e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {question.kind === 'SLIDING_SCALE' && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <TextField
            label="Min *"
            type="number"
            value={question.min}
            onChange={(e) => set('min', e.target.value)}
          />
          <TextField
            label="Max *"
            type="number"
            value={question.max}
            onChange={(e) => set('max', e.target.value)}
          />
          <TextField
            label="Step"
            type="number"
            min={1}
            value={question.step}
            onChange={(e) => set('step', e.target.value)}
          />
          <TextField
            label="Min label"
            placeholder="Poor"
            value={question.minLabel}
            onChange={(e) => set('minLabel', e.target.value)}
          />
          <TextField
            label="Max label"
            placeholder="Great"
            value={question.maxLabel}
            onChange={(e) => set('maxLabel', e.target.value)}
          />
        </div>
      )}

      {/* Shared toggles */}
      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={question.mandatory}
            onChange={(e) => set('mandatory', e.target.checked)}
            className="rounded border-slate-300"
          />
          Mandatory
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={question.condition.enabled}
            onChange={(e) =>
              set('condition', { ...question.condition, enabled: e.target.checked })
            }
            className="rounded border-slate-300"
          />
          Conditional visibility
        </label>
      </div>

      {question.condition.enabled && (
        <div className="mt-2 rounded-md border border-slate-100 bg-slate-50/60 p-2">
          {targets.length === 0 ? (
            <p className="text-xs text-slate-500">
              Add a question before this one (with a Question ID) to use it as a condition.
            </p>
          ) : (
            <div className="space-y-3">
              <SelectInput
                label="Show when question"
                options={targets}
                value={question.condition.questionId}
                onChange={(e) =>
                  set('condition', { ...question.condition, questionId: e.target.value })
                }
                placeholder="Select question…"
              />

              {!question.condition.questionId ? null : selectedSource &&
                (selectedSource.kind === 'SINGLE_SELECT' ||
                  selectedSource.kind === 'MULTI_SELECT') &&
                selectedSource.options.length > 0 ? (
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">
                    …answer is any of
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSource.options.map((opt) => {
                      const active = equalsValues.includes(opt.value)
                      return (
                        <label
                          key={opt.value}
                          className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1 text-xs transition ${
                            active
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => toggleEquals(opt.value)}
                            className="rounded border-slate-300"
                          />
                          {opt.label}
                        </label>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <TextField
                  label="…equals (comma separated)"
                  placeholder="good, great"
                  value={question.condition.equals}
                  onChange={(e) =>
                    set('condition', { ...question.condition, equals: e.target.value })
                  }
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const QuestionEditor = memo(QuestionEditorImpl)
