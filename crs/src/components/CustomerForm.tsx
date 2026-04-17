import { useState, type FormEvent } from 'react'
import { ComboBox } from './ComboBox'
import { SearchInput } from './SearchInput'
import { useBusinessUnitGroups } from '../hooks/useBusinessUnitGroups'
import { upsertCustomerById, patchCustomerById } from '../api/client'
import type { UpsertCustomerDto, PatchCustomerByIdDto, CustomerResponseDto, CustomerStatus, AdditionalInputDto } from '../api/client'

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'IsCreditBlocked', label: 'Credit Blocked' },
  { value: 'Inactive', label: 'Inactive' },
]

const EMPTY_INPUT: AdditionalInputDto = {
  id: '',
  displayText: '',
  receiptLabel: '',
  regularExpression: '',
  inputRequired: false,
}

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  customer?: CustomerResponseDto
}

export function CustomerForm({ open, onClose, onSaved, customer }: Props) {
  const isEditing = !!customer

  const [name, setName] = useState(customer?.name ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? '')
  const [address, setAddress] = useState(customer?.address ?? '')
  const [businessUnitGroup, setBusinessUnitGroup] = useState(customer?.businessUnitGroup ?? '')
  const [externalCustomerId, setExternalCustomerId] = useState(customer?.externalCustomerId ?? '')
  const [discountPercent, setDiscountPercent] = useState(customer?.discountPercent != null ? String(customer.discountPercent) : '')
  const [status, setStatus] = useState<CustomerStatus>(customer?.status ?? 'Active')
  const [requireProject, setRequireProject] = useState(customer?.requireProject ?? false)
  const [requireIdentification, setRequireIdentification] = useState(customer?.requireIdentification ?? false)
  const [requireRequisition, setRequireRequisition] = useState(customer?.requireRequisition ?? false)
  const [creditTotal, setCreditTotal] = useState(customer?.creditLimit ? String(customer.creditLimit.total) : '')
  const [creditAvailable, setCreditAvailable] = useState(customer?.creditLimit ? String(customer.creditLimit.available) : '')
  const [licenses, setLicenses] = useState(customer?.licenses?.join(', ') ?? '')
  const [promotionsJson, setPromotionsJson] = useState(customer?.promotions ? JSON.stringify(customer.promotions, null, 2) : '')
  const [additionalInputs, setAdditionalInputs] = useState<AdditionalInputDto[]>(customer?.additionalInputs ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const groupsQuery = useBusinessUnitGroups(open)

  const groupOptions = (groupsQuery.data ?? []).map((g) => ({
    value: g.id,
    label: g.name ?? g.id,
  }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    let promotions: Array<Record<string, unknown>> | undefined
    if (promotionsJson.trim()) {
      try {
        promotions = JSON.parse(promotionsJson.trim())
      } catch {
        setError('Promotions must be valid JSON (array of objects)')
        setSubmitting(false)
        return
      }
    }

    const filteredInputs = additionalInputs.filter((ai) => ai.id && ai.displayText)

    try {
      if (isEditing) {
        const body: PatchCustomerByIdDto = {
          name: name || undefined,
          phone: phone || undefined,
          address: address || undefined,
          businessUnitGroup: businessUnitGroup || undefined,
          externalCustomerId: externalCustomerId || undefined,
          discountPercent: discountPercent ? Number(discountPercent) : undefined,
          status,
          requireProject,
          requireIdentification,
          requireRequisition,
          licenses: licenses.trim() ? licenses.split(',').map((l) => l.trim()).filter(Boolean) : undefined,
          promotions,
          additionalInputs: filteredInputs.length > 0 ? filteredInputs : undefined,
          creditLimit: creditTotal || creditAvailable
            ? { total: Number(creditTotal), available: Number(creditAvailable), versionTimestamp: new Date().toISOString() }
            : undefined,
        }
        await patchCustomerById({ body, path: { customerId: customer.customerId }, throwOnError: true })
      } else {
        const body: UpsertCustomerDto = {
          name: name || undefined,
          phone: phone || undefined,
          address: address || undefined,
          businessUnitGroup: businessUnitGroup || undefined,
          externalCustomerId: externalCustomerId || undefined,
          discountPercent: discountPercent ? Number(discountPercent) : undefined,
          status,
          requireProject,
          requireIdentification,
          requireRequisition,
          licenses: licenses.trim() ? licenses.split(',').map((l) => l.trim()).filter(Boolean) : undefined,
          promotions,
          additionalInputs: filteredInputs.length > 0 ? filteredInputs : undefined,
          creditLimit: {
            total: Number(creditTotal),
            available: Number(creditAvailable),
            versionTimestamp: new Date().toISOString(),
          },
        }
        await upsertCustomerById({ body, throwOnError: true })
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-16 pb-8">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {isEditing ? 'Edit Customer' : 'Create Customer'}
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

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            <SearchInput
              label="Name *"
              placeholder="Acme AB"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <SearchInput
              label="Phone"
              placeholder="555-0100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <SearchInput
              label="Address"
              placeholder="Main Street 10"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <ComboBox
              label="Business Unit Group"
              options={groupOptions}
              value={businessUnitGroup}
              onChange={setBusinessUnitGroup}
              placeholder="Search groups..."
              isLoading={groupsQuery.isLoading}
            />
            <SearchInput
              label="External Customer ID"
              placeholder="EXT-10001"
              value={externalCustomerId}
              onChange={(e) => setExternalCustomerId(e.target.value)}
            />
            <SearchInput
              label="Discount %"
              type="number"
              placeholder="0"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
            />
            <div>
              <p className="mb-1 block text-xs font-medium text-slate-600">Status</p>
              <div className="rounded-md border border-slate-300 bg-white p-2 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => {
                    const checked = status === option.value

                    return (
                      <label
                        key={option.value}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          checked
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="customer-status"
                          checked={checked}
                          onChange={() => {
                            const value = option.value as CustomerStatus
                            setStatus(value)
                          }}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        {option.label}
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="col-span-2 flex items-end gap-4 pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={requireProject}
                  onChange={(e) => setRequireProject(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Require Project
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={requireIdentification}
                  onChange={(e) => setRequireIdentification(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Require ID
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={requireRequisition}
                  onChange={(e) => setRequireRequisition(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Require Requisition
              </label>
            </div>
            <SearchInput
              label="Licenses"
              placeholder="LIC-001, LIC-002"
              value={licenses}
              onChange={(e) => setLicenses(e.target.value)}
            />
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-medium text-slate-600">Credit Limit</p>
            <div className="grid grid-cols-2 gap-3">
              <SearchInput
                label={isEditing ? 'Total' : 'Total *'}
                type="number"
                placeholder="10000"
                value={creditTotal}
                onChange={(e) => setCreditTotal(e.target.value)}
                required={!isEditing}
              />
              <SearchInput
                label={isEditing ? 'Available' : 'Available *'}
                type="number"
                placeholder="10000"
                value={creditAvailable}
                onChange={(e) => setCreditAvailable(e.target.value)}
                required={!isEditing}
              />
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-medium text-slate-600">Promotions (JSON)</p>
            <textarea
              rows={3}
              placeholder='[{"type":"discount","value":10}]'
              value={promotionsJson}
              onChange={(e) => setPromotionsJson(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-600">Additional Inputs</p>
              <button
                type="button"
                onClick={() => setAdditionalInputs((prev) => [...prev, { ...EMPTY_INPUT }])}
                className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                + Add Input
              </button>
            </div>
            {additionalInputs.map((ai, idx) => (
              <div key={idx} className="mb-2 grid grid-cols-6 gap-2 rounded-md border border-slate-200 bg-slate-50/50 p-2">
                <SearchInput
                  label="ID *"
                  placeholder="input-1"
                  value={ai.id}
                  onChange={(e) => {
                    const updated = [...additionalInputs]
                    updated[idx] = { ...ai, id: e.target.value }
                    setAdditionalInputs(updated)
                  }}
                />
                <SearchInput
                  label="Display Text *"
                  placeholder="Enter value"
                  value={ai.displayText}
                  onChange={(e) => {
                    const updated = [...additionalInputs]
                    updated[idx] = { ...ai, displayText: e.target.value }
                    setAdditionalInputs(updated)
                  }}
                />
                <SearchInput
                  label="Receipt Label"
                  placeholder="Label"
                  value={ai.receiptLabel ?? ''}
                  onChange={(e) => {
                    const updated = [...additionalInputs]
                    updated[idx] = { ...ai, receiptLabel: e.target.value }
                    setAdditionalInputs(updated)
                  }}
                />
                <SearchInput
                  label="Regex"
                  placeholder="^[0-9]+$"
                  value={ai.regularExpression ?? ''}
                  onChange={(e) => {
                    const updated = [...additionalInputs]
                    updated[idx] = { ...ai, regularExpression: e.target.value }
                    setAdditionalInputs(updated)
                  }}
                />
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={ai.inputRequired ?? false}
                      onChange={(e) => {
                        const updated = [...additionalInputs]
                        updated[idx] = { ...ai, inputRequired: e.target.checked }
                        setAdditionalInputs(updated)
                      }}
                      className="rounded border-slate-300"
                    />
                    Required
                  </label>
                </div>
                <div className="flex items-end pb-1">
                  <button
                    type="button"
                    onClick={() => setAdditionalInputs((prev) => prev.filter((_, i) => i !== idx))}
                    className="rounded p-1 text-slate-400 hover:bg-white hover:text-red-500"
                    title="Remove"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
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
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
