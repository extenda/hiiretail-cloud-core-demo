import { useState, type FormEvent } from 'react'
import { SearchInput } from './SearchInput'
import { SelectInput } from './SelectInput'
import type { CustomerSearchFilters } from '../hooks/useCustomerSearch'

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'IsCreditBlocked', label: 'Credit Blocked' },
  { value: 'Inactive', label: 'Inactive' },
]

interface Props {
  onSearch: (filters: CustomerSearchFilters) => void
  isLoading: boolean
  onCreateClick: () => void
}

const EMPTY: CustomerSearchFilters = {
  businessUnitId: '',
  externalCustomerId: '',
  status: '',
  name: '',
  phone: '',
  address: '',
}

export function CustomerSearchPanel({ onSearch, isLoading, onCreateClick }: Props) {
  const [filters, setFilters] = useState<CustomerSearchFilters>({ ...EMPTY })
  const [isCollapsed, setIsCollapsed] = useState(false)

  const set = (key: keyof CustomerSearchFilters) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setFilters((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch({ ...filters, skip: 0, take: 50 })
  }

  const handleReset = () => {
    setFilters({ ...EMPTY })
    onSearch({ ...EMPTY, skip: 0, take: 50 })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-3">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2"
        >
          <h2 className="text-sm font-semibold text-slate-800">Search Customers</h2>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onCreateClick}
          className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          + Create Customer
        </button>
      </div>

      {!isCollapsed && (
        <form onSubmit={handleSubmit} className="border-t border-slate-100 px-5 pb-4 pt-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <SearchInput
              label="Name"
              placeholder="Acme AB"
              value={filters.name ?? ''}
              onChange={set('name')}
            />
            <SearchInput
              label="Phone"
              placeholder="555-0100"
              value={filters.phone ?? ''}
              onChange={set('phone')}
            />
            <SearchInput
              label="Address"
              placeholder="Main street 10"
              value={filters.address ?? ''}
              onChange={set('address')}
            />
            <SearchInput
              label="Business Unit"
              placeholder="B2B-SE"
              value={filters.businessUnitId ?? ''}
              onChange={set('businessUnitId')}
            />
            <SearchInput
              label="External ID"
              placeholder="EXT-10001"
              value={filters.externalCustomerId ?? ''}
              onChange={set('externalCustomerId')}
            />
            <SelectInput
              label="Status"
              options={STATUS_OPTIONS}
              value={filters.status ?? ''}
              onChange={set('status')}
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
