import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'

export interface ComboBoxOption {
  value: string
  label: string
}

interface Props {
  label: string
  options: ComboBoxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isLoading?: boolean
  className?: string
}

export function ComboBox({
  label,
  options,
  value,
  onChange,
  placeholder = 'Search...',
  isLoading = false,
  className = '',
}: Props) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = label.toLowerCase().replace(/\s+/g, '-')

  const selectedOption = options.find((o) => o.value === value)

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setActiveIndex(-1)
  }, [query])

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const select = useCallback(
    (val: string) => {
      onChange(val)
      setQuery('')
      setIsOpen(false)
    },
    [onChange],
  )

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen && e.key !== 'Escape') {
      setIsOpen(true)
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && filtered[activeIndex]) {
          select(filtered[activeIndex].value)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  return (
    <div className={className} ref={containerRef}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>

      {selectedOption ? (
        <div className="flex w-full items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm">
          <span className="flex-1 truncate text-slate-900">{selectedOption.label}</span>
          <button
            type="button"
            onClick={() => {
              onChange('')
              setQuery('')
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
            className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear selection"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            ref={inputRef}
            id={id}
            type="text"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />

          {isLoading && (
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              <svg className="h-4 w-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {isOpen && !isLoading && (
            <ul
              ref={listRef}
              className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg"
              role="listbox"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-slate-400">No results</li>
              ) : (
                filtered.map((opt, i) => (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={`cursor-pointer px-3 py-1.5 ${
                      i === activeIndex ? 'bg-indigo-50 text-indigo-700' : 'text-slate-900 hover:bg-slate-50'
                    }`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(opt.value)}
                  >
                    {opt.label}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
