import type { SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: { value: string; label: string }[]
  /** Text for the empty/default option. Set to `false` to hide it entirely. Defaults to "All". */
  placeholder?: string | false
}

export function SelectInput({
  label,
  options,
  id,
  className = '',
  placeholder = 'All',
  ...rest
}: Props) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={className}>
      <label
        htmlFor={selectId}
        className="mb-1 block text-xs font-medium text-slate-600"
      >
        {label}
      </label>
      <select
        id={selectId}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        {...rest}
      >
        {placeholder !== false && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
