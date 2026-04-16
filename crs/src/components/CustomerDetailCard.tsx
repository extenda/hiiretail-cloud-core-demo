import { StatusBadge } from './StatusBadge'
import type { CustomerResponseDto } from '../api/client'

interface Props {
  customer: CustomerResponseDto
  onEditClick?: () => void
}

export function CustomerDetailCard({ customer, onEditClick }: Props) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 shadow-sm">
      <div className="flex items-start justify-between px-5 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-500">
            Customer
          </p>
          <h3 className="mt-0.5 text-lg font-semibold text-slate-900">
            {customer.name || customer.customerId}
          </h3>
        </div>
        {onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            className="rounded-md border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
          >
            Edit
          </button>
        )}
      </div>
      <div className="border-t border-indigo-100 px-5 py-3">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
          <Field label="customerId" value={customer.customerId} mono />
          <Field label="name" value={customer.name} />
          <Field label="phone" value={customer.phone} />
          <Field label="address" value={customer.address} />
          <Field label="businessUnitGroup" value={customer.businessUnitGroup} />
          <Field label="externalCustomerId" value={customer.externalCustomerId} mono />
          <Field label="status">
            <StatusBadge status={customer.status} />
          </Field>
          <Field label="discountPercent" value={customer.discountPercent != null ? String(customer.discountPercent) : undefined} />
          <Field label="requireProject" value={String(customer.requireProject ?? false)} />
          <Field label="requireIdentification" value={String(customer.requireIdentification ?? false)} />
          <Field label="requireRequisition" value={String(customer.requireRequisition ?? false)} />
          <Field label="licenses" value={customer.licenses?.length ? customer.licenses.join(', ') : undefined} />
        </dl>

        {customer.creditLimit && (
          <div className="mt-3 rounded-lg border border-indigo-100 bg-white p-3">
            <h4 className="mb-1 text-xs font-semibold text-slate-500">creditLimit</h4>
            <dl className="grid grid-cols-3 gap-x-6 gap-y-1 text-sm">
              <Field label="creditLimit.total" value={String(customer.creditLimit.total)} />
              <Field label="creditLimit.available" value={String(customer.creditLimit.available)} />
              <Field label="creditLimit.versionTimestamp" value={customer.creditLimit.versionTimestamp} mono />
            </dl>
          </div>
        )}

        {customer.additionalInputs && customer.additionalInputs.length > 0 && (
          <div className="mt-3 rounded-lg border border-indigo-100 bg-white p-3">
            <h4 className="mb-1 text-xs font-semibold text-slate-500">additionalInputs</h4>
            <div className="space-y-2">
              {customer.additionalInputs.map((ai) => (
                <dl key={ai.id} className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
                  <Field label="id" value={ai.id} mono />
                  <Field label="displayText" value={ai.displayText} />
                  <Field label="receiptLabel" value={ai.receiptLabel} />
                  <Field label="regularExpression" value={ai.regularExpression} mono />
                  <Field label="inputRequired" value={String(ai.inputRequired ?? false)} />
                </dl>
              ))}
            </div>
          </div>
        )}

        {customer.promotions && customer.promotions.length > 0 && (
          <div className="mt-3 rounded-lg border border-indigo-100 bg-white p-3">
            <h4 className="mb-1 text-xs font-semibold text-slate-500">promotions</h4>
            <pre className="max-h-40 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-600">
              {JSON.stringify(customer.promotions, null, 2)}
            </pre>
          </div>
        )}
      </div>
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
