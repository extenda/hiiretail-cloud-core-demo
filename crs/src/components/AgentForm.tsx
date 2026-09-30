import { useState, type FormEvent } from 'react'
import { SearchInput } from './SearchInput'
import { NewBadge } from '../whatsnew/NewBadge'
import { upsertAgent, patchAgentById } from '../api/client'
import type { UpsertAgentByIdDto, PatchAgentByIdDto, TrustedAgentResponseDto } from '../api/client'

interface Props {
  open: boolean
  customerId: string
  customerName?: string
  onClose: () => void
  onSaved: () => void
  agent?: TrustedAgentResponseDto
}

export function AgentForm({ open, customerId, customerName, onClose, onSaved, agent }: Props) {
  const isEditing = !!agent

  const [agentId, setAgentId] = useState(agent?.agentId ?? '')
  const [name, setName] = useState(agent?.name ?? '')
  const [externalAgentId, setExternalAgentId] = useState(agent?.externalAgentId ?? '')
  const [phone, setPhone] = useState(agent?.phone ?? '')
  const [email, setEmail] = useState(agent?.email ?? '')
  const [identityNumber, setIdentityNumber] = useState(agent?.identityNumber ?? '')
  const [requireIdentification, setRequireIdentification] = useState(agent?.requireIdentification ?? false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      if (isEditing) {
        const body: PatchAgentByIdDto = {
          name,
          phone: phone || undefined,
          email: email || undefined,
          identityNumber: identityNumber || undefined,
          requireIdentification,
        }
        await patchAgentById({ body, path: { agentId: agent.agentId }, throwOnError: true })
      } else {
        const body: UpsertAgentByIdDto = {
          agentId: agentId || undefined,
          customerId,
          name,
          externalAgentId: externalAgentId || undefined,
          phone: phone || undefined,
          email: email || undefined,
          identityNumber: identityNumber || undefined,
          requireIdentification,
        }
        await upsertAgent({ body, throwOnError: true })
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-16 pb-8">
      <div className="w-full max-w-md rounded-xl border border-amber-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-amber-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {isEditing ? 'Edit Agent' : 'Create Agent'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Customer: <span className="font-medium">{customerName || customerId}</span>
          </div>

          <div className="space-y-3">
           {isEditing ? (
               <div>
                 <label className="mb-1 block text-xs font-medium text-slate-600">Agent ID</label>
                 <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-500">
                   {agent.agentId}
                 </p>
               </div>
             ) : (
               <SearchInput
                 label="Agent ID"
                 placeholder="Auto-generated if empty"
                 value={agentId}
                 onChange={(e) => setAgentId(e.target.value)}
               />
             )}
             <SearchInput
               label="Name *"
               placeholder="Agent name"
               value={name}
               onChange={(e) => setName(e.target.value)}
               required
             />
             <SearchInput
               label="External Agent ID"
               placeholder="AGT-10001"
               value={externalAgentId}
               onChange={(e) => setExternalAgentId(e.target.value)}
             />
          </div>

          <div className="mt-4 border-t border-amber-100 pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-600">
              Contact details
              <NewBadge title="Phone (normalised to E.164), email (validated) and identity number" />
            </p>
            <div className="grid grid-cols-2 gap-3">
              <SearchInput
                label="Phone"
                placeholder="+46701234567"
                hint="Normalised to E.164"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <SearchInput
                label="Email"
                type="email"
                placeholder="agent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <SearchInput
                label="Identity Number"
                placeholder="19850101-1234"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
              />
              <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={requireIdentification}
                  onChange={(e) => setRequireIdentification(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Require ID at checkout
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-amber-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
