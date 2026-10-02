import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ComboBox } from './ComboBox'
import { SearchInput } from './SearchInput'
import { useBusinessUnits } from '../hooks/useBusinessUnits'
import { createCustomer } from '../api/client'
import type { CreateCustomerRequestDto, CustomerResponseDto } from '../api/client'

const STATUS_ERRORS: Record<number, string> = {
  403: 'Unauthorized. The client needs the crs.customer.write permission.',
  412: 'No proxy is configured for this tenant (see PUT /proxy-config).',
  502: 'The tenant proxy was unreachable, failed, or returned an invalid response.',
}

type Outcome =
  | { kind: 'created'; customer: CustomerResponseDto }
  | { kind: 'accepted'; message: string }

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function ProxyCreateCustomerForm({ open, onClose, onCreated }: Props) {
  const [phone, setPhone] = useState('')
  const [businessUnitId, setBusinessUnitId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const unitsQuery = useBusinessUnits(undefined, open)

  const unitOptions = (unitsQuery.data ?? []).map((u) => ({
    value: u.id,
    label: u.name ? `${u.name} (${u.id})` : u.id,
  }))

  const handleClose = () => {
    setError(null)
    setOutcome(null)
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setOutcome(null)
    setSubmitting(true)

    const body: CreateCustomerRequestDto = {
      phone,
      businessUnitId,
      name: name || undefined,
      email: email || undefined,
      address: address || undefined,
    }

    try {
      const { data, error: apiError, response } = await createCustomer({ body })

      if (response.status === 200) {
        setOutcome({ kind: 'created', customer: data as CustomerResponseDto })
        onCreated()
      } else if (response.status === 202) {
        setOutcome({ kind: 'accepted', message: (data as { message: string }).message })
      } else {
        const detail = STATUS_ERRORS[response.status] ?? JSON.stringify(apiError)
        setError(`${response.status}: ${detail}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-16 pb-8">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Create Customer via Tenant Proxy</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              POST /customers:create. The tenant decides: 200 stores and returns the customer, 202 returns a
              message and the customer arrives later via external ingest.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            <SearchInput
              label="Phone *"
              placeholder="+46701234567"
              hint="International format (E.164)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <ComboBox
              label="Business Unit *"
              options={unitOptions}
              value={businessUnitId}
              onChange={setBusinessUnitId}
              placeholder="Search business units..."
              isLoading={unitsQuery.isLoading}
            />
            <SearchInput
              label="Name"
              placeholder="Acme Builders"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <SearchInput
              label="Email"
              type="email"
              placeholder="buyer@acme.example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <SearchInput
              label="Address"
              placeholder="Main Street 1, Stockholm"
              className="col-span-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {outcome?.kind === 'created' && (
            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
              <span className="font-medium">200 Created.</span> The customer is stored.{' '}
              <Link to={`/customers/${outcome.customer.customerId}`} className="font-medium underline">
                Open {outcome.customer.name ?? outcome.customer.customerId}
              </Link>
            </div>
          )}

          {outcome?.kind === 'accepted' && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              <p className="font-medium">202 Accepted. Nothing stored yet.</p>
              <p className="mt-1">
                Message for the till: <span className="italic">“{outcome.message}”</span>
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {outcome ? 'Close' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting || !businessUnitId}
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create via Proxy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
