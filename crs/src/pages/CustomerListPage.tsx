import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CustomerSearchPanel } from '../components/CustomerSearchPanel'
import { CustomerTable } from '../components/CustomerTable'
import { CustomerForm } from '../components/CustomerForm'
import { useCustomerSearch, type CustomerSearchFilters } from '../hooks/useCustomerSearch'
import type { CustomerSearchItemDto } from '../api/client'

export function CustomerListPage() {
  const navigate = useNavigate()
  const [customerFilters, setCustomerFilters] = useState<CustomerSearchFilters>({ skip: 0, take: 50 })
  const [showCreateCustomer, setShowCreateCustomer] = useState(false)

  const customerQuery = useCustomerSearch(customerFilters)

  const handleCustomerSearch = useCallback((filters: CustomerSearchFilters) => {
    setCustomerFilters(filters)
  }, [])

  const handleCustomerPageChange = useCallback(
    (skip: number) => {
      setCustomerFilters((prev) => ({ ...prev, skip }))
    },
    [],
  )

  const handleSelectCustomer = useCallback(
    (customer: CustomerSearchItemDto) => {
      navigate(`/customers/${customer.customerId}`)
    },
    [navigate],
  )

  const handleCustomerCreated = useCallback(() => {
    customerQuery.refetch()
  }, [customerQuery])

  return (
    <>
      <div className="space-y-4">
        <CustomerSearchPanel
          onSearch={handleCustomerSearch}
          isLoading={customerQuery.isLoading}
          onCreateClick={() => setShowCreateCustomer(true)}
        />

        {customerQuery.isLoading && (
          <LoadingCard label="Searching customers..." />
        )}

        {customerQuery.error && (
          <ErrorCard message={String(customerQuery.error)} />
        )}

        {customerQuery.data && (
          <div>
            <SectionHeader
              count={customerQuery.data.items.length}
              label="customers"
              hasMore={customerQuery.data.page.hasMore}
            />
            <CustomerTable
              items={customerQuery.data.items}
              page={customerQuery.data.page}
              selectedCustomerId={null}
              onSelect={handleSelectCustomer}
              onPageChange={handleCustomerPageChange}
            />
          </div>
        )}
      </div>

      <CustomerForm
        open={showCreateCustomer}
        onClose={() => setShowCreateCustomer(false)}
        onSaved={handleCustomerCreated}
      />
    </>
  )
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
      <svg
        className="h-5 w-5 animate-spin text-indigo-500"
        fill="none"
        viewBox="0 0 24 24"
      >
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

function SectionHeader({
  count,
  label,
  hasMore,
}: {
  count: number
  label: string
  hasMore: boolean
}) {
  return (
    <p className="mb-2 text-xs font-medium text-slate-500">
      Showing {count} {label}
      {hasMore && ' (more available)'}
    </p>
  )
}
