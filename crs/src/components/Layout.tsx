import { useState, type ReactNode } from 'react'
import { useAuth } from '../auth/useAuth'

export function Layout({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
            CRS
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold leading-tight text-slate-900">
              Customer Registry Service
            </h1>
            <p className="text-xs text-slate-500">B2B Demo Explorer</p>
          </div>

          {confirmClear ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Clear credentials?</span>
              <button
                onClick={() => { logout(); setConfirmClear(false); }}
                className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              title="Change or clear stored OCMS credentials"
            >
              Change Credentials
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
