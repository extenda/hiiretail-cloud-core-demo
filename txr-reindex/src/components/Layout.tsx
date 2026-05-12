import type { ReactNode } from 'react'

export type AppTab = 'reindex' | 'pubsub'

interface LayoutProps {
  children: ReactNode
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                TXR Reindexer Monitor
              </h1>
              <p className="text-xs text-slate-500">
                cloud-core-prod-2d76 · europe-west1
              </p>
            </div>
          </div>

          <nav className="flex gap-1 mt-4 -mb-4">
            <TabButton active={activeTab === 'reindex'} onClick={() => onTabChange('reindex')}>
              Reindex
            </TabButton>
            <TabButton active={activeTab === 'pubsub'} onClick={() => onTabChange('pubsub')}>
              Pub/Sub Republish
            </TabButton>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  )
}
