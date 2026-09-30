import { useState, type ReactNode } from 'react'
import { HighlightContext } from './HighlightContext'

const STORAGE_KEY = 'crs_highlight_changes'

function load(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

export function HighlightProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(load)

  const setEnabled = (next: boolean) => {
    setEnabledState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
    } catch {
      // storage unavailable, keep in-memory state only
    }
  }

  return (
    <HighlightContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </HighlightContext.Provider>
  )
}
