export type QuestionKind =
  | 'TEXT'
  | 'SINGLE_SELECT'
  | 'MULTI_SELECT'
  | 'SLIDING_SCALE'

export interface OptionDraft {
  value: string
  label: string
}

export interface ConditionDraft {
  enabled: boolean
  questionId: string
  /** comma-separated list of accepted answer values */
  equals: string
}

export interface QuestionDraft {
  /** local-only stable key for React */
  uid: string
  kind: QuestionKind
  questionId: string
  text: string
  mandatory: boolean
  condition: ConditionDraft
  // TEXT
  maxLength: string
  // SINGLE_SELECT / MULTI_SELECT
  options: OptionDraft[]
  // MULTI_SELECT
  minSelections: string
  maxSelections: string
  // SLIDING_SCALE
  min: string
  max: string
  step: string
  minLabel: string
  maxLabel: string
}

import type { SurveyDto } from '../api/client'

export const QUESTION_KIND_OPTIONS: { value: QuestionKind; label: string }[] = [
  { value: 'TEXT', label: 'Free text' },
  { value: 'SINGLE_SELECT', label: 'Single select' },
  { value: 'MULTI_SELECT', label: 'Multi select' },
  { value: 'SLIDING_SCALE', label: 'Sliding scale' },
]

let uidCounter = 0
function nextUid() {
  uidCounter += 1
  return `q_${Date.now()}_${uidCounter}`
}

function asString(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  return ''
}

/** Map a survey's stored questions into editable drafts (used for the read-only detail view). */
export function surveyToQuestionDrafts(questions: SurveyDto['questions']): QuestionDraft[] {
  return questions.map((raw) => {
    const q = raw as Record<string, unknown>
    const kind = (asString(q.inputType) as QuestionKind) || 'TEXT'
    const draft = createQuestionDraft(kind)
    draft.questionId = asString(q.questionId)
    draft.text = asString(q.text)
    draft.mandatory = q.mandatory === true

    const cond = q.condition as Record<string, unknown> | undefined
    if (cond) {
      const equals = Array.isArray(cond.equals) ? cond.equals.map(asString) : []
      draft.condition = {
        enabled: true,
        questionId: asString(cond.questionId),
        equals: equals.join(', '),
      }
    }

    if (kind === 'TEXT') {
      draft.maxLength = asString(q.maxLength)
    }

    if (kind === 'SINGLE_SELECT' || kind === 'MULTI_SELECT') {
      const opts = Array.isArray(q.options) ? (q.options as Record<string, unknown>[]) : []
      if (opts.length > 0) {
        draft.options = opts.map((o) => ({ value: asString(o.value), label: asString(o.label) }))
      }
    }

    if (kind === 'MULTI_SELECT') {
      draft.minSelections = asString(q.minSelections)
      draft.maxSelections = asString(q.maxSelections)
    }

    if (kind === 'SLIDING_SCALE') {
      draft.min = asString(q.min)
      draft.max = asString(q.max)
      draft.step = asString(q.step) || '1'
      draft.minLabel = asString(q.minLabel)
      draft.maxLabel = asString(q.maxLabel)
    }

    return draft
  })
}

export function createQuestionDraft(kind: QuestionKind = 'TEXT'): QuestionDraft {
  return {
    uid: nextUid(),
    kind,
    questionId: '',
    text: '',
    mandatory: true,
    condition: { enabled: false, questionId: '', equals: '' },
    maxLength: '500',
    options: [
      { value: '', label: '' },
      { value: '', label: '' },
    ],
    minSelections: '',
    maxSelections: '',
    min: '0',
    max: '10',
    step: '1',
    minLabel: '',
    maxLabel: '',
  }
}
