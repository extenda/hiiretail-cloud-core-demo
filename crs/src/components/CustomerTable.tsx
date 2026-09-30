import { DataTable } from './DataTable'
import { StatusBadge } from './StatusBadge'
import { LoyaltyBadge } from './LoyaltyBadge'
import { Pagination } from './Pagination'
import { NewBadge } from '../whatsnew/NewBadge'
import type { CustomerSearchItemDto, PageInfoDto } from '../api/client'

interface Props {
  items: CustomerSearchItemDto[]
  page?: PageInfoDto
  selectedCustomerId: string | null
  onSelect: (customer: CustomerSearchItemDto) => void
  onPageChange: (skip: number) => void
}

const columns = [
  { key: 'name', header: 'Name' },
  {
    key: 'status',
    header: 'Status',
    render: (row: CustomerSearchItemDto) => <StatusBadge status={row.status} />,
  },
  {
    key: 'customerType',
    header: (
      <span className="inline-flex items-center gap-1.5">
        Type <NewBadge dot title="Customer type: CASH or CREDIT, absent = unknown" />
      </span>
    ),
    render: (row: CustomerSearchItemDto) => (
      <StatusBadge status={row.customerType} title={row.customerType ? undefined : 'Unknown'} />
    ),
  },
  {
    key: 'loyalty',
    header: (
      <span className="inline-flex items-center gap-1.5">
        Loyalty <NewBadge dot title="Loyalty: member, not eligible, or absent" />
      </span>
    ),
    render: (row: CustomerSearchItemDto) => <LoyaltyBadge loyalty={row.loyalty} />,
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
}: Props) {
  return (
    <div className="space-y-2">
      <DataTable
        columns={columns}
        data={items}
        getRowKey={(r) => r.customerId}
        onRowClick={onSelect}
        selectedKey={selectedCustomerId}
      />
      <Pagination page={page} onPageChange={onPageChange} />
    </div>
  )
}
