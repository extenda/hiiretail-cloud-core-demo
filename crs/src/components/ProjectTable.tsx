import { DataTable } from './DataTable'
import { StatusBadge } from './StatusBadge'
import { Pagination } from './Pagination'
import type { ProjectSearchItemDto, PageInfoDto } from '../api/client'

interface Props {
  items: ProjectSearchItemDto[]
  page?: PageInfoDto
  onPageChange: (skip: number) => void
  onEditClick?: (project: ProjectSearchItemDto) => void
}

const columns = [
  { key: 'name', header: 'Name' },
  {
    key: 'status',
    header: 'Status',
    render: (row: ProjectSearchItemDto) => <StatusBadge status={row.status} />,
  },
  { key: 'city', header: 'City' },
  { key: 'fromDate', header: 'From' },
  { key: 'toDate', header: 'To' },
]

function renderExpandedProject(project: ProjectSearchItemDto, onEditClick?: (project: ProjectSearchItemDto) => void) {
  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
        <Field label="projectId" value={project.projectId} mono />
        <Field label="customerId" value={project.customerId} mono />
        <Field label="name" value={project.name} />
        <Field label="status">
          <StatusBadge status={project.status} />
        </Field>
        <Field label="externalProjectId" value={project.externalProjectId} mono />
        <Field label="externalReferenceId" value={project.externalReferenceId} mono />
        <Field label="businessUnitGroup" value={project.businessUnitGroup} />
        <Field label="addressLine1" value={project.addressLine1} />
        <Field label="addressLine2" value={project.addressLine2} />
        <Field label="zipCode" value={project.zipCode} />
        <Field label="city" value={project.city} />
        <Field label="fromDate" value={project.fromDate} />
        <Field label="toDate" value={project.toDate} />
        {project.restrictions && project.restrictions.length > 0 && (
          <div className="col-span-full">
            <dt className="font-mono text-xs text-slate-500">restrictions</dt>
            <dd>
              <pre className="mt-1 max-h-40 overflow-auto rounded bg-white p-2 text-xs text-slate-600">
                {JSON.stringify(project.restrictions, null, 2)}
              </pre>
            </dd>
          </div>
        )}
      </dl>
      {onEditClick && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEditClick(project) }}
            className="rounded-md border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  )
}

export function ProjectTable({ items, page, onPageChange, onEditClick }: Props) {
  return (
    <div className="space-y-2">
      <DataTable
        columns={columns}
        data={items}
        getRowKey={(r) => r.projectId}
        expandedRender={(project) => renderExpandedProject(project, onEditClick)}
      />
      <Pagination page={page} onPageChange={onPageChange} />
    </div>
  )
}

function Field({
  label,
  value,
  mono,
  children,
}: {
  label: string
  value?: string
  mono?: boolean
  children?: React.ReactNode
}) {
  return (
    <div>
      <dt className="font-mono text-xs text-slate-500">{label}</dt>
      <dd className={`font-medium text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>
        {children ?? value ?? <span className="text-slate-300">—</span>}
      </dd>
    </div>
  )
}
