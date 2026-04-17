import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CustomerListPage } from './pages/CustomerListPage'
import { CustomerDetailPage } from './pages/CustomerDetailPage'
import { IngestExplorerPage } from './pages/IngestExplorerPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CustomerListPage />} />
        <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
        <Route path="/ingest" element={<IngestExplorerPage />} />
      </Routes>
    </Layout>
  )
}

export default App
