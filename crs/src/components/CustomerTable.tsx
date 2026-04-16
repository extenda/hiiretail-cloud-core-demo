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
