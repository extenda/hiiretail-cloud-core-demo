import { useState, type FormEvent } from 'react'
import { ComboBox } from './ComboBox'
import { SearchInput } from './SearchInput'
import { useBusinessUnitGroups } from '../hooks/useBusinessUnitGroups'
import { upsertProjectById, patchProjectById } from '../api/client'
import type { UpsertProjectDto, PatchProjectByIdDto, ProjectSearchItemDto } from '../api/client'

interface Props {
  open: boolean
  customerId: string
  customerName?: string
  onClose: () => void
  onSaved: () => void
  project?: ProjectSearchItemDto
}

export function ProjectForm({ open, customerId, customerName, onClose, onSaved, project }: Props) {
  const isEditing = !!project

  const [name, setName] = useState(project?.name ?? '')
  const [businessUnitGroup, setBusinessUnitGroup] = useState(project?.businessUnitGroup ?? '')
  const [externalProjectId, setExternalProjectId] = useState(project?.externalProjectId ?? '')
  const [externalReferenceId, setExternalReferenceId] = useState(project?.externalReferenceId ?? '')
  const [addressLine1, setAddressLine1] = useState(project?.addressLine1 ?? '')
  const [addressLine2, setAddressLine2] = useState(project?.addressLine2 ?? '')
  const [zipCode, setZipCode] = useState(project?.zipCode ?? '')
  const [city, setCity] = useState(project?.city ?? '')
  const [fromDate, setFromDate] = useState(project?.fromDate ?? '')
  const [toDate, setToDate] = useState(project?.toDate ?? '')
  const [restrictionsJson, setRestrictionsJson] = useState(
    project?.restrictions ? JSON.stringify(project.restrictions, null, 2) : '',
  )
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

    let restrictions: Array<Record<string, unknown>> | undefined
    if (restrictionsJson.trim()) {
      try {
        restrictions = JSON.parse(restrictionsJson.trim())
      } catch {
        setError('Restrictions must be valid JSON (array of objects)')
        setSubmitting(false)
        return
      }
    }

    try {
      if (isEditing) {
        const body: PatchProjectByIdDto = {
          name: name || undefined,
          businessUnitGroup: businessUnitGroup || undefined,
          externalProjectId: externalProjectId || undefined,
          externalReferenceId: externalReferenceId || undefined,
          addressLine1: addressLine1 || undefined,
          addressLine2: addressLine2 || undefined,
          zipCode: zipCode || undefined,
          city: city || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          restrictions,
        }
        await patchProjectById({ body, path: { projectId: project.projectId }, throwOnError: true })
      } else {
        const body: UpsertProjectDto = {
          customerId,
          name: name || undefined,
          businessUnitGroup: businessUnitGroup || undefined,
          externalProjectId: externalProjectId || undefined,
          externalReferenceId,
          addressLine1,
          addressLine2: addressLine2 || undefined,
          zipCode: zipCode || undefined,
          city: city || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          restrictions,
        }
        await upsertProjectById({ body, throwOnError: true })
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
      <div className="w-full max-w-2xl rounded-xl border border-emerald-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-emerald-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {isEditing ? 'Edit Project' : 'Create Project'}
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
          <div className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Customer: <span className="font-medium">{customerName || customerId}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SearchInput
              label="Name"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              label="Ext. Project ID"
              placeholder="PROJ-EX-10001"
              value={externalProjectId}
              onChange={(e) => setExternalProjectId(e.target.value)}
            />
            <SearchInput
              label={isEditing ? 'Ext. Reference ID' : 'Ext. Reference ID *'}
              placeholder="ERP-PROJ-10001"
              value={externalReferenceId}
              onChange={(e) => setExternalReferenceId(e.target.value)}
              required={!isEditing}
            />
            <SearchInput
              label={isEditing ? 'Address Line 1' : 'Address Line 1 *'}
              placeholder="Main Street 10"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              required={!isEditing}
            />
            <SearchInput
              label="Address Line 2"
              placeholder="Suite 200"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
            />
            <SearchInput
              label="ZIP Code"
              placeholder="12345"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
            <SearchInput
              label="City"
              placeholder="Stockholm"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <SearchInput
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <SearchInput
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="mt-4 border-t border-emerald-100 pt-4">
            <p className="mb-2 text-xs font-medium text-slate-600">Restrictions (JSON)</p>
            <textarea
              rows={3}
              placeholder='[{"type":"maxAmount","value":5000}]'
              value={restrictionsJson}
              onChange={(e) => setRestrictionsJson(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
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
              className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
