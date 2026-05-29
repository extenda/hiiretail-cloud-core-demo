import type { SurveyDto } from '../api/client'

export type QuestionKind = 'TEXT' | 'SINGLE_SELECT' | 'MULTI_SELECT' | 'SLIDING_SCALE'

export interface FillOption {
  value: string
  label: string
}

export interface FillCondition {
  questionId: string
  equals: string[]
}

export interface FillQuestion {
  questionId: string
  text: string
  kind: QuestionKind
  mandatory: boolean
  condition?: FillCondition
  // TEXT
  maxLength?: number
  // SINGLE_SELECT / MULTI_SELECT
  options?: FillOption[]
  // MULTI_SELECT
  minSelections?: number
  maxSelections?: number
  // SLIDING_SCALE
  min?: number
  max?: number
  step?: number
  minLabel?: string
  maxLabel?: string
}

/** Answer value shapes — identical to the API's AnswerWriteDto.answer union. */
export type AnswerValue =
  | { type: 'TEXT'; value: string }
  | { type: 'SINGLE_SELECT'; value: string }
  | { type: 'MULTI_SELECT'; values: string[] }
  | { type: 'SLIDING_SCALE'; value: number }

function asString(v: unknown): string | undefined {
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  return undefined
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  return undefined
}

export function normalizeQuestions(questions: SurveyDto['questions']): FillQuestion[] {
  return questions.map((raw) => {
    const q = raw as Record<string, unknown>
    const kind = (asString(q.inputType) as QuestionKind) || 'TEXT'

    const fq: FillQuestion = {
      questionId: asString(q.questionId) ?? '',
      text: asString(q.text) ?? '',
      kind,
      mandatory: q.mandatory === true,
    }

    const cond = q.condition as Record<string, unknown> | undefined
    if (cond && asString(cond.questionId)) {
      fq.condition = {
        questionId: asString(cond.questionId) ?? '',
        equals: Array.isArray(cond.equals)
          ? cond.equals.map(asString).filter((v): v is string => v !== undefined)
          : [],
      }
    }

    if (kind === 'TEXT') {
      fq.maxLength = asNumber(q.maxLength) ?? 500
    }

    if (kind === 'SINGLE_SELECT' || kind === 'MULTI_SELECT') {
      const opts = Array.isArray(q.options) ? (q.options as Record<string, unknown>[]) : []
      fq.options = opts.map((o) => ({
        value: asString(o.value) ?? '',
        label: asString(o.label) ?? asString(o.value) ?? '',
      }))
    }

    if (kind === 'MULTI_SELECT') {
      fq.minSelections = asNumber(q.minSelections)
      fq.maxSelections = asNumber(q.maxSelections)
    }

    if (kind === 'SLIDING_SCALE') {
      fq.min = asNumber(q.min) ?? 0
      fq.max = asNumber(q.max) ?? 10
      fq.step = asNumber(q.step) ?? 1
      fq.minLabel = asString(q.minLabel)
      fq.maxLabel = asString(q.maxLabel)
    }

    return fq
  })
}

/** Whether a question should be shown given the current answers (honours visibility conditions). */
export function isQuestionVisible(
  question: FillQuestion,
  answers: Record<string, AnswerValue>,
): boolean {
  if (!question.condition) return true
  const dep = answers[question.condition.questionId]
  if (!dep) return false
  const accepted = question.condition.equals
  switch (dep.type) {
    case 'MULTI_SELECT':
      return dep.values.some((v) => accepted.includes(v))
    case 'SLIDING_SCALE':
      return accepted.includes(String(dep.value))
    default:
      return accepted.includes(dep.value)
  }
}

/** Parse the API's answers map (questionId -> answer value object) into typed AnswerValues. */
export function parseAnswers(
  map: Record<string, unknown> | undefined,
): Record<string, AnswerValue> {
  const out: Record<string, AnswerValue> = {}
  if (!map) return out
  for (const [questionId, raw] of Object.entries(map)) {
    const v = raw as Record<string, unknown>
    switch (v?.type) {
      case 'TEXT':
        if (typeof v.value === 'string') out[questionId] = { type: 'TEXT', value: v.value }
        break
      case 'SINGLE_SELECT':
        if (typeof v.value === 'string')
          out[questionId] = { type: 'SINGLE_SELECT', value: v.value }
        break
      case 'MULTI_SELECT':
        if (Array.isArray(v.values))
          out[questionId] = {
            type: 'MULTI_SELECT',
            values: v.values.filter((x): x is string => typeof x === 'string'),
          }
        break
      case 'SLIDING_SCALE':
        if (typeof v.value === 'number')
          out[questionId] = { type: 'SLIDING_SCALE', value: v.value }
        break
    }
  }
  return out
}

/** True when the answer carries a usable value (used for mandatory checks). */
export function isAnswered(value: AnswerValue | undefined): boolean {
  if (!value) return false
  switch (value.type) {
    case 'MULTI_SELECT':
      return value.values.length > 0
    case 'TEXT':
    case 'SINGLE_SELECT':
      return value.value.trim() !== ''
    case 'SLIDING_SCALE':
      return true
  }
}
