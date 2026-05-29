import { useState, type FormEvent } from 'react'
import { TextField } from '../components/TextField'
import { SelectInput } from '../components/SelectInput'
import { FillRunner } from '../components/FillRunner'
import { useSurveySearch } from '../hooks/useSurveySearch'
import type { Product, SurveySummaryDto } from '../api/client'

const PRODUCT_OPTIONS: { value: Product; label: string }[] = [
  { value: 'Checkout App', label: 'Checkout App' },
  { value: 'Self Checkout', label: 'Self Checkout' },
  { value: 'Hii Checkout Mobile', label: 'Hii Checkout Mobile' },
]

interface FillContext {
  businessUnitId: string
  product: Product
  workstationId?: string
}

export function FillSurveyPage() {
  const [businessUnitId, setBusinessUnitId] = useState('')
  const [product, setProduct] = useState<Product | ''>('')
  const [workstationId, setWorkstationId] = useState('')
  const [context, setContext] = useState<FillContext | null>(null)
  const [fillSurveyId, setFillSurveyId] = useState<string | null>(null)

  const canSubmit = businessUnitId.trim() !== '' && product !== ''

  const query = useSurveySearch(
    {
      businessUnitId: context?.businessUnitId,
      product: context?.product,
      status: 'RUNNING',
      skip: 0,
      take: 50,
    },
    context !== null,
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setContext({
      businessUnitId: businessUnitId.trim(),
      product: product as Product,
      workstationId: workstationId.trim() || undefined,
    })
  }

  if (context && fillSurveyId) {
    return (
      <FillRunner
        surveyId={fillSurveyId}
        context={context}
        onExit={() => setFillSurveyId(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <ContextCard
        businessUnitId={businessUnitId}
        product={product}
        workstationId={workstationId}
        canSubmit={canSubmit}
        isLoading={query.isLoading}
        onBusinessUnitChange={setBusinessUnitId}
        onProductChange={setProduct}
        onWorkstationChange={setWorkstationId}
        onSubmit={handleSubmit}
      />

      {context && (
        <div className="space-y-3">
          <ActiveContextBar
            context={context}
            onChange={() => setContext(null)}
          />

          {query.isLoading && <LoadingCard label="Finding active surveys..." />}
          {query.error && <ErrorCard message={String(query.error)} />}

          {query.data && (
            <SurveyPickList
              items={query.data.items}
              onFill={(survey) => setFillSurveyId(survey.surveyId)}
            />
          )}
        </div>
      )}
    </div>
  )
}

function ContextCard({
  businessUnitId,
  product,
  workstationId,
  canSubmit,
  isLoading,
  onBusinessUnitChange,
  onProductChange,
  onWorkstationChange,
  onSubmit,
}: {
  businessUnitId: string
  product: Product | ''
  workstationId: string
  canSubmit: boolean
  isLoading: boolean
  onBusinessUnitChange: (value: string) => void
  onProductChange: (value: Product | '') => void
  onWorkstationChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Where are you filling this from?</h2>
      <p className="mt-1 text-sm text-slate-500">
        Pick a business unit and product to see the surveys currently running for that store.
      </p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-2xl">
          <TextField
            label="Business unit ID"
            placeholder="e.g. bu-123"
            value={businessUnitId}
            onChange={(e) => onBusinessUnitChange(e.target.value)}
          />
          <SelectInput
            label="Product"
            options={PRODUCT_OPTIONS}
            value={product}
            onChange={(e) => onProductChange(e.target.value as Product | '')}
            placeholder="Select product…"
          />
          <TextField
            label="Workstation ID (optional)"
            placeholder="e.g. pos-01"
            value={workstationId}
            onChange={(e) => onWorkstationChange(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit || isLoading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Finding…' : 'Find surveys'}
        </button>
      </form>
    </div>
  )
}

function ActiveContextBar({
  context,
  onChange,
}: {
  context: FillContext
  onChange: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <span>Showing running surveys for</span>
      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-slate-700">
        {context.businessUnitId}
      </span>
      <span>·</span>
      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
        {context.product}
      </span>
      {context.workstationId && (
        <>
          <span>·</span>
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-slate-700">
            {context.workstationId}
          </span>
        </>
      )}
      <button
        type="button"
        onClick={onChange}
        className="ml-1 rounded-md px-2 py-0.5 font-medium text-indigo-600 hover:bg-indigo-50"
      >
        Change
      </button>
    </div>
  )
}

function SurveyPickList({
  items,
  onFill,
}: {
  items: SurveySummaryDto[]
  onFill: (survey: SurveySummaryDto) => void
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
        No active surveys for this business unit and product.
      </div>
    )
  }

  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {items.map((survey) => (
        <li
          key={survey.surveyId}
          className="flex items-center gap-4 px-5 py-4"
        >
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {survey.name || survey.surveyId}
            </h3>
            {survey.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                {survey.description}
              </p>
            )}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <Tag tone="indigo">{survey.userType}</Tag>
              {survey.products.map((p) => (
                <Tag key={p}>{p}</Tag>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFill(survey)}
            className="shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Fill out →
          </button>
        </li>
      ))}
    </ul>
  )
}

function Tag({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode
  tone?: 'slate' | 'indigo'
}) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-50 text-indigo-700',
  }
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
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
