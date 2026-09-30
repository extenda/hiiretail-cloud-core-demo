import { DataTable } from './DataTable'
import { Pagination } from './Pagination'
import { Field } from './Field'
import { NewBadge } from '../whatsnew/NewBadge'
import type { TrustedAgentResponseDto, PageInfoDto } from '../api/client'

interface Props {
  items: TrustedAgentResponseDto[]
  page?: PageInfoDto
  onPageChange: (skip: number) => void
  onEditClick?: (agent: TrustedAgentResponseDto) => void
}

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'externalAgentId', header: 'Ext. Agent ID' },
  {
    key: 'phone',
    header: (
      <span className="inline-flex items-center gap-1.5">
        Phone <NewBadge dot title="Agent phone, stored in E.164" />
      </span>
    ),
  },
  {
    key: 'email',
    header: (
      <span className="inline-flex items-center gap-1.5">
        Email <NewBadge dot title="Agent email address" />
      </span>
    ),
  },
]

function renderExpandedAgent(agent: TrustedAgentResponseDto, onEditClick?: (agent: TrustedAgentResponseDto) => void) {
  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
        <Field label="agentId" value={agent.agentId} mono />
        <Field label="customerId" value={agent.customerId} mono />
        <Field label="name" value={agent.name} />
        <Field label="externalAgentId" value={agent.externalAgentId} mono />
        <Field label="businessUnitGroup" value={agent.businessUnitGroup} />
        <Field label="phone" value={agent.phone} isNew newTitle="Agent phone, stored in E.164" />
        <Field label="email" value={agent.email} isNew newTitle="Agent email address" />
        <Field label="identityNumber" value={agent.identityNumber} mono isNew newTitle="Agent identity number" />
        <Field label="requireIdentification" value={String(agent.requireIdentification ?? false)} />
      </dl>
      {onEditClick && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEditClick(agent) }}
            className="rounded-md border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  )
}

export function AgentTable({ items, page, onPageChange, onEditClick }: Props) {
  return (
    <div className="space-y-2">
      <DataTable
        columns={columns}
        data={items}
        getRowKey={(r) => r.agentId}
        expandedRender={(agent) => renderExpandedAgent(agent, onEditClick)}
      />
      <Pagination page={page} onPageChange={onPageChange} />
    </div>
  )
}
