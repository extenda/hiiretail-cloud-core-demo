import type { AnswerValue, FillQuestion } from '../lib/fillModel'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  question: FillQuestion
  index: number
  value: AnswerValue | undefined
  status: SaveStatus
  /** Disable all inputs and hide the save indicator. */
  readOnly?: boolean
  /** Update the local value without persisting (used while typing). */
  onLocalChange: (value: AnswerValue | undefined) => void
  /** Persist the answer (or clear it when value is undefined). */
  onCommit: (value: AnswerValue | undefined) => void
}

export function QuestionField({
  question,
  index,
  value,
  status,
  readOnly = false,
  onLocalChange,
  onCommit,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-xs font-semibold text-indigo-700">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">
            {question.text}
            {question.mandatory && <span className="ml-1 text-red-500">*</span>}
          </p>
        </div>
        {!readOnly && <SaveIndicator status={status} />}
      </div>

      <div className="pl-9">
        {question.kind === 'TEXT' && (
          <TextInput question={question} value={value} readOnly={readOnly} onLocalChange={onLocalChange} onCommit={onCommit} />
        )}
        {question.kind === 'SINGLE_SELECT' && (
          <SingleSelectInput question={question} value={value} readOnly={readOnly} onCommit={onCommit} />
        )}
        {question.kind === 'MULTI_SELECT' && (
          <MultiSelectInput question={question} value={value} readOnly={readOnly} onCommit={onCommit} />
        )}
        {question.kind === 'SLIDING_SCALE' && (
          <SlidingScaleInput question={question} value={value} readOnly={readOnly} onLocalChange={onLocalChange} onCommit={onCommit} />
        )}
      </div>
    </div>
  )
}

function TextInput({
  question,
  value,
  readOnly,
  onLocalChange,
  onCommit,
}: {
  question: FillQuestion
  value: AnswerValue | undefined
  readOnly: boolean
  onLocalChange: (value: AnswerValue | undefined) => void
  onCommit: (value: AnswerValue | undefined) => void
}) {
  const text = value?.type === 'TEXT' ? value.value : ''
  const maxLength = question.maxLength ?? 500
  const multiline = maxLength > 120

  const commit = () => onCommit(text.trim() ? { type: 'TEXT', value: text } : undefined)
  const handleChange = (next: string) => onLocalChange({ type: 'TEXT', value: next })

  const shared =
    'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

  return (
    <div>
      {multiline ? (
        <textarea
          rows={3}
          maxLength={maxLength}
          value={text}
          disabled={readOnly}
          placeholder={readOnly ? '—' : 'Type your answer…'}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={commit}
          className={shared}
        />
      ) : (
        <input
          type="text"
          maxLength={maxLength}
          value={text}
          disabled={readOnly}
          placeholder={readOnly ? '—' : 'Type your answer…'}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={commit}
          className={shared}
        />
      )}
      {!readOnly && (
        <div className="mt-1 text-right text-[11px] text-slate-400">
          {text.length}/{maxLength}
        </div>
      )}
    </div>
  )
}

function SingleSelectInput({
  question,
  value,
  readOnly,
  onCommit,
}: {
  question: FillQuestion
  value: AnswerValue | undefined
  readOnly: boolean
  onCommit: (value: AnswerValue | undefined) => void
}) {
  const selected = value?.type === 'SINGLE_SELECT' ? value.value : ''
  return (
    <div className="space-y-2">
      {(question.options ?? []).map((opt) => {
        const active = selected === opt.value
        return (
          <label
            key={opt.value}
            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${
              readOnly ? '' : 'cursor-pointer'
            } ${
              active
                ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
                : `border-slate-200 text-slate-700 ${readOnly ? '' : 'hover:bg-slate-50'}`
            }`}
          >
            <input
              type="radio"
              name={question.questionId}
              checked={active}
              disabled={readOnly}
              onChange={() => onCommit({ type: 'SINGLE_SELECT', value: opt.value })}
              className="text-indigo-600"
            />
            {opt.label}
          </label>
        )
      })}
    </div>
  )
}

function MultiSelectInput({
  question,
  value,
  readOnly,
  onCommit,
}: {
  question: FillQuestion
  value: AnswerValue | undefined
  readOnly: boolean
  onCommit: (value: AnswerValue | undefined) => void
}) {
  const values = value?.type === 'MULTI_SELECT' ? value.values : []
  const max = question.maxSelections
  const atMax = max !== undefined && values.length >= max

  const toggle = (optValue: string) => {
    const next = values.includes(optValue)
      ? values.filter((v) => v !== optValue)
      : [...values, optValue]
    onCommit(next.length > 0 ? { type: 'MULTI_SELECT', values: next } : undefined)
  }

  return (
    <div className="space-y-2">
      {(question.options ?? []).map((opt) => {
        const active = values.includes(opt.value)
        const disabled = readOnly || (!active && atMax)
        return (
          <label
            key={opt.value}
            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${
              active
                ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
                : disabled
                  ? `border-slate-200 ${readOnly ? 'text-slate-500' : 'text-slate-300'}`
                  : 'cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={active}
              disabled={disabled}
              onChange={() => toggle(opt.value)}
              className="rounded border-slate-300 text-indigo-600"
            />
            {opt.label}
          </label>
        )
      })}
      {(question.minSelections !== undefined || question.maxSelections !== undefined) && (
        <p className="text-[11px] text-slate-400">
          {question.minSelections !== undefined && `Min ${question.minSelections}`}
          {question.minSelections !== undefined && question.maxSelections !== undefined && ' · '}
          {question.maxSelections !== undefined && `Max ${question.maxSelections}`}
        </p>
      )}
    </div>
  )
}

function SlidingScaleInput({
  question,
  value,
  readOnly,
  onLocalChange,
  onCommit,
}: {
  question: FillQuestion
  value: AnswerValue | undefined
  readOnly: boolean
  onLocalChange: (value: AnswerValue | undefined) => void
  onCommit: (value: AnswerValue | undefined) => void
}) {
  const min = question.min ?? 0
  const max = question.max ?? 10
  const step = question.step ?? 1
  const current = value?.type === 'SLIDING_SCALE' ? value.value : min

  return (
    <div>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          disabled={readOnly}
          onChange={(e) => onLocalChange({ type: 'SLIDING_SCALE', value: Number(e.target.value) })}
          onMouseUp={() => onCommit({ type: 'SLIDING_SCALE', value: current })}
          onTouchEnd={() => onCommit({ type: 'SLIDING_SCALE', value: current })}
          onKeyUp={() => onCommit({ type: 'SLIDING_SCALE', value: current })}
          className="h-2 flex-1 cursor-pointer accent-indigo-600 disabled:cursor-not-allowed"
        />
        <span className="w-10 shrink-0 text-center text-sm font-semibold text-slate-900">
          {value?.type === 'SLIDING_SCALE' ? current : '—'}
        </span>
      </div>
      {(question.minLabel || question.maxLabel) && (
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>{question.minLabel ?? min}</span>
          <span>{question.maxLabel ?? max}</span>
        </div>
      )}
    </div>
  )
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Saving
      </span>
    )
  }
  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Saved
      </span>
    )
  }
  return <span className="text-[11px] font-medium text-red-500">Couldn’t save</span>
}
