import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { triggerExecution } from '../api/client'

const DEFAULT_INDEX = 'txr-transactions-v3'
const MAX_RANGE_DAYS = 14

interface PubsubJobFormProps {
  onClose: () => void
}

export function PubsubJobForm({ onClose }: PubsubJobFormProps) {
  const queryClient = useQueryClient()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [backingIndex, setBackingIndex] = useState(DEFAULT_INDEX)
  const [tenantId, setTenantId] = useState('')
  const [successName, setSuccessName] = useState<string | null>(null)

  const rangeError = (() => {
    if (!dateFrom || !dateTo) return null
    const from = Date.parse(dateFrom)
    const to = Date.parse(dateTo)
    if (isNaN(from) || isNaN(to)) return null
    if (to < from) return '"To" must not be before "From"'
    const days = (to - from) / (1000 * 60 * 60 * 24)
    if (days > MAX_RANGE_DAYS) return `Range exceeds ${MAX_RANGE_DAYS} days`
    return null
  })()

  const mutation = useMutation({
    mutationFn: () =>
      triggerExecution(
        backingIndex.trim(),
        tenantId.trim() || undefined,
        undefined,
        'pubsub',
        `${dateFrom}/${dateTo}`,
      ),
    onSuccess: (data) => {
      setSuccessName(data.executionName)
      void queryClient.invalidateQueries({ queryKey: ['monitor'] })
    },
  })

  if (successName !== null) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-green-800 mb-0.5">Pub/Sub job started</p>
          <p className="text-xs text-green-700 font-mono break-all">
            {successName || 'execution created'}
          </p>
        </div>
        <button
          onClick={() => {
            setSuccessName(null)
            setDateFrom('')
            setDateTo('')
            setBackingIndex(DEFAULT_INDEX)
            setTenantId('')
            mutation.reset()
            onClose()
          }}
          className="shrink-0 text-green-600 hover:text-green-800 text-xs underline"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Start Pub/Sub Republish Job</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (rangeError) return
          mutation.mutate()
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <FormField label="Date From" required>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            required
            className="block rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </FormField>

        <FormField label="Date To" required>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            required
            min={dateFrom || undefined}
            className="block rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </FormField>

        <FormField label="Datastream Index" required>
          <input
            type="text"
            value={backingIndex}
            onChange={(e) => setBackingIndex(e.target.value)}
            required
            className="block min-w-[220px] rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </FormField>

        <FormField label="Tenant ID" required={false}>
          <input
            type="text"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="optional"
            className="block min-w-[160px] rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </FormField>

        <div className="pb-0.5">
          <button
            type="submit"
            disabled={mutation.status === 'pending' || !dateFrom || !dateTo || !!rangeError}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {mutation.status === 'pending' ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Starting…
              </>
            ) : (
              'Run'
            )}
          </button>
        </div>
      </form>

      {rangeError && (
        <p className="mt-2 text-xs text-amber-600">{rangeError}</p>
      )}

      {mutation.isError && (
        <p className="mt-3 text-xs text-red-600 font-mono">
          {(mutation.error as Error).message}
        </p>
      )}
    </div>
  )
}

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
