import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function SearchInput({ label, id, className = '', ...rest }: Props) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="mb-1 block text-xs font-medium text-slate-600"
      >
        {label}
      </label>
      <input
        id={inputId}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        {...rest}
      />
    </div>
  )
}
