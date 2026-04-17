import { DataTable } from './DataTable'
import { Pagination } from './Pagination'
import type { TrustedAgentResponseDto, PageInfoDto } from '../api/client'

interface Props {
  items: TrustedAgentResponseDto[]
  page?: PageInfoDto
  onPageChange: (skip: number) => void
  onEditClick?: (agent: TrustedAgentResponseDto) => void
  onDeleteClick?: (agent: TrustedAgentResponseDto) => void
  deletingAgentId?: string | null
}

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'externalAgentId', header: 'Ext. Agent ID' },
]

function renderExpandedAgent(
  agent: TrustedAgentResponseDto,
  onEditClick?: (agent: TrustedAgentResponseDto) => void,
  onDeleteClick?: (agent: TrustedAgentResponseDto) => void,
  deletingAgentId?: string | null,
) {
  const isDeleting = deletingAgentId === agent.id

  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
        <Field label="id" value={agent.id} mono />
        <Field label="tenantId" value={agent.tenantId} mono />
        <Field label="customerId" value={agent.customerId} mono />
        <Field label="name" value={agent.name} />
        <Field label="externalCustomerId" value={agent.externalCustomerId} mono />
        <Field label="externalAgentId" value={agent.externalAgentId} mono />
        <Field label="businessUnitGroup" value={agent.businessUnitGroup} />
      </dl>
      {(onEditClick || onDeleteClick) && (
        <div className="mt-2 flex justify-end">
          <div className="flex gap-2">
            {onEditClick && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditClick(agent)
                }}
                className="rounded-md border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
              >
                Edit
              </button>
            )}
            {onDeleteClick && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteClick(agent)
                }}
                className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function AgentTable({ items, page, onPageChange, onEditClick, onDeleteClick, deletingAgentId }: Props) {
  return (
    <div className="space-y-2">
      <DataTable
        columns={columns}
        data={items}
        getRowKey={(r) => r.id}
        expandedRender={(agent) => renderExpandedAgent(agent, onEditClick, onDeleteClick, deletingAgentId)}
      />
      <Pagination page={page} onPageChange={onPageChange} />
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
