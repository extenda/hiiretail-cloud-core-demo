import { useState } from 'react'
import { Layout, type AppTab } from './components/Layout'
import { MonitorPage } from './pages/MonitorPage'
import { PubsubPage } from './pages/PubsubPage'

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('reindex')

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'reindex' ? <MonitorPage /> : <PubsubPage />}
    </Layout>
  )
}

export default App
