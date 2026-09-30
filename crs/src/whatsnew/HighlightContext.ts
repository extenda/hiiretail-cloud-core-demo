import { createContext } from 'react'

export interface HighlightContextValue {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

export const HighlightContext = createContext<HighlightContextValue | null>(null)
