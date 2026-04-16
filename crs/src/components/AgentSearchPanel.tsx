import { useState, type FormEvent } from 'react'
import { SearchInput } from './SearchInput'
import type { AgentSearchFilters } from '../hooks/useAgentSearch'

interface Props {
  customerId: string
  onSearch: (filters: AgentSearchFilters) => void
  isLoading: boolean
  onCreateClick: () => void
}

export function AgentSearchPanel({ customerId, onSearch, isLoading, onCreateClick }: Props) {
  const [filters, setFilters] = useState<AgentSearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  const set = (key: keyof AgentSearchFilters) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => setFilters((f) => ({ ...f, [key]: e.target.value }))

  const handleShowAll = () => {
    setFilters({})
    onSearch({ customerId, skip: 0, take: 50 })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch({ ...filters, customerId, skip: 0, take: 50 })
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-[10px] font-bold text-amber-700">
            A
          </span>
          Trusted Agents
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
          <button
            type="button"
            onClick={handleShowAll}
            disabled={isLoading}
            className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Show All for Customer'}
          </button>
          <button
            type="button"
            onClick={onCreateClick}
            className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-amber-700"
          >
            + Create
          </button>
        </div>
      </div>

      {showFilters && (
        <form onSubmit={handleSubmit} className="border-t border-amber-100 px-5 pb-4 pt-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <SearchInput
              label="Name"
              placeholder="Agent name"
              value={filters.name ?? ''}
              onChange={set('name')}
            />
            <SearchInput
              label="Ext. Agent ID"
              placeholder="AGT-10001"
              value={filters.externalAgentId ?? ''}
              onChange={set('externalAgentId')}
            />
            <SearchInput
              label="Business Unit"
              placeholder="bu-001"
              value={filters.businessUnitId ?? ''}
              onChange={set('businessUnitId')}
            />
            <SearchInput
              label="Ext. Customer ID"
              placeholder="CUST-EX-10001"
              value={filters.externalCustomerId ?? ''}
              onChange={set('externalCustomerId')}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-amber-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setFilters({})}
              className="rounded-md border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Reset Filters
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
