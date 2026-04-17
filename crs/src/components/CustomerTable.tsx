import { DataTable } from './DataTable'
import { StatusBadge } from './StatusBadge'
import { Pagination } from './Pagination'
import type { CustomerSearchItemDto, PageInfoDto } from '../api/client'

interface Props {
  items: CustomerSearchItemDto[]
  page?: PageInfoDto
  selectedCustomerId: string | null
  onSelect: (customer: CustomerSearchItemDto) => void
  onPageChange: (skip: number) => void
  onDeleteClick?: (customer: CustomerSearchItemDto) => void
  deletingCustomerId?: string | null
}

const columns = [
  { key: 'name', header: 'Name' },
  {
    key: 'status',
    header: 'Status',
    render: (row: CustomerSearchItemDto) => <StatusBadge status={row.status} />,
  },
  { key: 'businessUnitGroup', header: 'BU Group' },
  { key: 'phone', header: 'Phone' },
  { key: 'externalCustomerId', header: 'Ext. Customer ID' },
]

export function CustomerTable({
  items,
  page,
  selectedCustomerId,
  onSelect,
  onPageChange,
  onDeleteClick,
  deletingCustomerId,
}: Props) {
  return (
    <div className="space-y-2">
      <DataTable
        columns={columns}
        data={items}
        getRowKey={(r) => r.customerId}
        onRowClick={onSelect}
        selectedKey={selectedCustomerId}
        expandedRender={(customer) => renderExpandedCustomer(customer, onDeleteClick, deletingCustomerId)}
      />
      <Pagination page={page} onPageChange={onPageChange} />
    </div>
  )
}

function renderExpandedCustomer(
  customer: CustomerSearchItemDto,
  onDeleteClick?: (customer: CustomerSearchItemDto) => void,
  deletingCustomerId?: string | null,
) {
  const isDeleting = deletingCustomerId === customer.customerId

  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
        <Field label="customerId" value={customer.customerId} mono />
        <Field label="name" value={customer.name} />
        <Field label="status" value={customer.status} />
        <Field label="businessUnitGroup" value={customer.businessUnitGroup} />
        <Field label="phone" value={customer.phone} />
        <Field label="address" value={customer.address} />
        <Field label="externalCustomerId" value={customer.externalCustomerId} mono />
      </dl>
      {onDeleteClick && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation()
              onDeleteClick(customer)
            }}
            className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  mono,
}: {
  label: string
  value?: string
  mono?: boolean
}) {
  return (
    <div>
      <dt className="font-mono text-xs text-slate-500">{label}</dt>
      <dd className={`font-medium text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>
        {value ?? <span className="text-slate-300">—</span>}
      </dd>
    </div>
  )
}
