import { useState, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CustomerDetailCard } from '../components/CustomerDetailCard'
import { CustomerForm } from '../components/CustomerForm'
import { ProjectSearchPanel } from '../components/ProjectSearchPanel'
import { ProjectTable } from '../components/ProjectTable'
import { AgentSearchPanel } from '../components/AgentSearchPanel'
import { AgentTable } from '../components/AgentTable'
import { ProjectForm } from '../components/ProjectForm'
import { AgentForm } from '../components/AgentForm'
import { deleteAgentById } from '../api/client'
import { useCustomerById } from '../hooks/useCustomerById'
import { useProjectSearch, type ProjectSearchFilters } from '../hooks/useProjectSearch'
import { useAgentSearch, type AgentSearchFilters } from '../hooks/useAgentSearch'
import type { ProjectSearchItemDto, TrustedAgentResponseDto } from '../api/client'

type Tab = 'projects' | 'agents'

export function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const customerQuery = useCustomerById(customerId ?? null)

  const [activeTab, setActiveTab] = useState<Tab>('projects')

  const [projectFilters, setProjectFilters] = useState<ProjectSearchFilters | null>(null)
  const [agentFilters, setAgentFilters] = useState<AgentSearchFilters | null>(null)

  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showCreateAgent, setShowCreateAgent] = useState(false)
  const [showEditCustomer, setShowEditCustomer] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectSearchItemDto | null>(null)
  const [editingAgent, setEditingAgent] = useState<TrustedAgentResponseDto | null>(null)
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null)
  const [deleteAgentError, setDeleteAgentError] = useState<string | null>(null)

  useEffect(() => {
    if (customerId) {
      setProjectFilters({ customerId, skip: 0, take: 50 })
      setAgentFilters({ customerId, skip: 0, take: 50 })
    }
  }, [customerId])

  const projectQuery = useProjectSearch(projectFilters ?? {}, projectFilters !== null)
  const agentQuery = useAgentSearch(agentFilters ?? {}, agentFilters !== null)

  const handleProjectSearch = useCallback(
    (filters: ProjectSearchFilters) => setProjectFilters(filters),
    [],
  )

  const handleProjectPageChange = useCallback(
    (skip: number) => setProjectFilters((prev) => (prev ? { ...prev, skip } : prev)),
    [],
  )

  const handleAgentSearch = useCallback(
    (filters: AgentSearchFilters) => setAgentFilters(filters),
    [],
  )

  const handleAgentPageChange = useCallback(
    (skip: number) => setAgentFilters((prev) => (prev ? { ...prev, skip } : prev)),
    [],
  )

  const handleProjectCreated = useCallback(() => {
    projectQuery.refetch()
  }, [projectQuery])

  const handleAgentCreated = useCallback(() => {
    agentQuery.refetch()
  }, [agentQuery])

  const handleCustomerEdited = useCallback(() => {
    customerQuery.refetch()
  }, [customerQuery])

  const handleProjectEdited = useCallback(() => {
    projectQuery.refetch()
  }, [projectQuery])

  const handleAgentEdited = useCallback(() => {
    agentQuery.refetch()
  }, [agentQuery])

  const handleDeleteAgent = useCallback(
    async (agent: TrustedAgentResponseDto) => {
      const confirmed = window.confirm(`Delete agent "${agent.name ?? agent.id}"?`)
      if (!confirmed) return

      setDeleteAgentError(null)
      setDeletingAgentId(agent.id)

      try {
        const res = await deleteAgentById({ path: { agentId: agent.id } })
        if (res.error) {
          throw new Error(JSON.stringify(res.error))
        }
        await agentQuery.refetch()
      } catch (error) {
        setDeleteAgentError(String(error))
      } finally {
        setDeletingAgentId(null)
      }
    },
    [agentQuery],
  )

  if (customerQuery.isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
        <svg className="h-5 w-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading customer...
      </div>
    )
  }

  if (customerQuery.error) {
    return (
      <div className="space-y-3">
        <BackLink />
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
          <span className="font-medium">Error:</span> {String(customerQuery.error)}
        </div>
      </div>
    )
  }

  if (!customerQuery.data) {
    return (
      <div className="space-y-3">
        <BackLink />
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
          Customer not found.
        </div>
      </div>
    )
  }

  const customer = customerQuery.data

  return (
    <div className="space-y-4">
      <BackLink />

      <CustomerDetailCard customer={customer} onEditClick={() => setShowEditCustomer(true)} />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200">
        <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')}>
          Projects
          {projectQuery.data && (
            <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              {projectQuery.data.items.length}
              {projectQuery.data.page.hasMore && '+'}
            </span>
          )}
        </TabButton>
        <TabButton active={activeTab === 'agents'} onClick={() => setActiveTab('agents')}>
          Agents
          {agentQuery.data && (
            <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              {agentQuery.data.items.length}
              {agentQuery.data.page.hasMore && '+'}
            </span>
          )}
        </TabButton>
      </div>

      {/* Projects tab */}
      {activeTab === 'projects' && customerId && (
        <div className="space-y-3">
          <ProjectSearchPanel
            customerId={customerId}
            onSearch={handleProjectSearch}
            isLoading={projectQuery.isLoading}
            onCreateClick={() => setShowCreateProject(true)}
          />

          {projectQuery.isLoading && <LoadingCard label="Loading projects..." />}
          {projectQuery.error && <ErrorCard message={String(projectQuery.error)} />}

          {projectQuery.data && (
            <div>
              <SectionHeader
                count={projectQuery.data.items.length}
                label="projects"
                hasMore={projectQuery.data.page.hasMore}
              />
              <ProjectTable
                items={projectQuery.data.items}
                page={projectQuery.data.page}
                onPageChange={handleProjectPageChange}
                onEditClick={(project) => setEditingProject(project)}
              />
            </div>
          )}
        </div>
      )}

      {/* Agents tab */}
      {activeTab === 'agents' && customerId && (
        <div className="space-y-3">
          <AgentSearchPanel
            customerId={customerId}
            onSearch={handleAgentSearch}
            isLoading={agentQuery.isLoading}
            onCreateClick={() => setShowCreateAgent(true)}
          />

          {agentQuery.isLoading && <LoadingCard label="Loading agents..." />}
          {agentQuery.error && <ErrorCard message={String(agentQuery.error)} />}
          {deleteAgentError && <ErrorCard message={deleteAgentError} />}

          {agentQuery.data && (
            <div>
              <SectionHeader
                count={agentQuery.data.items.length}
                label="agents"
                hasMore={agentQuery.data.page.hasMore}
              />
              <AgentTable
                items={agentQuery.data.items}
                page={agentQuery.data.page}
                onPageChange={handleAgentPageChange}
                onEditClick={(agent) => setEditingAgent(agent)}
                onDeleteClick={handleDeleteAgent}
                deletingAgentId={deletingAgentId}
              />
            </div>
          )}
        </div>
      )}

      {customerId && (
        <>
          <CustomerForm
            open={showEditCustomer}
            onClose={() => setShowEditCustomer(false)}
            onSaved={handleCustomerEdited}
            customer={customer}
          />
          <ProjectForm
            open={showCreateProject}
            customerId={customerId}
            customerName={customer.name ?? customerId}
            onClose={() => setShowCreateProject(false)}
            onSaved={handleProjectCreated}
          />
          <ProjectForm
            key={editingProject?.projectId}
            open={editingProject !== null}
            customerId={customerId}
            customerName={customer.name ?? customerId}
            onClose={() => setEditingProject(null)}
            onSaved={handleProjectEdited}
            project={editingProject ?? undefined}
          />
          <AgentForm
            open={showCreateAgent}
            customerId={customerId}
            customerName={customer.name ?? customerId}
            onClose={() => setShowCreateAgent(false)}
            onSaved={handleAgentCreated}
          />
          <AgentForm
            key={editingAgent?.id}
            open={editingAgent !== null}
            customerId={customerId}
            customerName={customer.name ?? customerId}
            onClose={() => setEditingAgent(null)}
            onSaved={handleAgentEdited}
            agent={editingAgent ?? undefined}
          />
        </>
      )}
    </div>
  )
}

function BackLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back to customers
    </Link>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  )
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
      <svg className="h-5 w-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
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
