import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { triggerExecution } from '../api/client'

interface RunJobFormProps {
  onClose: () => void
}

export function RunJobForm({ onClose }: RunJobFormProps) {
  const queryClient = useQueryClient()
  const [backingIndexId, setBackingIndexId] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [successName, setSuccessName] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      triggerExecution(backingIndexId.trim(), tenantId.trim() || undefined),
    onSuccess: (data) => {
      setSuccessName(data.executionName)
      void queryClient.invalidateQueries({ queryKey: ['monitor'] })
    },
  })

  if (successName !== null) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-green-800 mb-0.5">Job started</p>
          <p className="text-xs text-green-700 font-mono break-all">{successName || 'execution created'}</p>
        </div>
        <button
          onClick={() => {
            setSuccessName(null)
            setBackingIndexId('')
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
        <h3 className="text-sm font-semibold text-slate-700">Run Reindex Job</h3>
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
          mutation.mutate()
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <FormField label="Backing Index ID" required>
          <input
            type="text"
            value={backingIndexId}
            onChange={(e) => setBackingIndexId(e.target.value)}
            placeholder="e.g. products-v3"
            required
            className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </FormField>

        <FormField label="Tenant ID" required={false}>
          <input
            type="text"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="optional"
            className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </FormField>

        <div className="flex items-center gap-2 pb-0.5">
          <button
            type="submit"
            disabled={mutation.status === 'pending' || !backingIndexId.trim()}
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
    <div className="flex flex-col gap-1 min-w-[220px]">
      <label className="text-xs font-medium text-slate-500">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
