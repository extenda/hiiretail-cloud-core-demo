import type { CustomerSearchItemDto } from '../api/client'

type Loyalty = CustomerSearchItemDto['loyalty']

export function LoyaltyBadge({ loyalty, showIdentifier = false }: { loyalty: Loyalty; showIdentifier?: boolean }) {
  if (!loyalty) {
    return (
      <span className="text-xs text-slate-400" title="Not a member. Cashier is prompted to offer membership.">
        —
      </span>
    )
  }

  if (loyalty.type === 'NOT_ELIGIBLE') {
    return (
      <span
        title="Never offer loyalty to this customer."
        className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20"
      >
        Not eligible
      </span>
    )
  }

  return (
    <span
      title={`Loyalty member. Identifier: ${loyalty.identifier}`}
      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
    >
      Member
      {showIdentifier && <span className="font-mono text-[11px] text-emerald-800">{loyalty.identifier}</span>}
    </span>
  )
}
