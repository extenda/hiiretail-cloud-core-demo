import type { ReactNode } from 'react'
import { NewBadge } from '../whatsnew/NewBadge'

interface Props {
  label: string
  value?: string
  mono?: boolean
  isNew?: boolean
  newTitle?: string
  children?: ReactNode
}

export function Field({ label, value, mono, isNew, newTitle, children }: Props) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
        {label}
        {isNew && <NewBadge dot title={newTitle} />}
      </dt>
      <dd className={`font-medium text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>
        {children ?? value ?? <span className="text-slate-300">—</span>}
      </dd>
    </div>
  )
}
