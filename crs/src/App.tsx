import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CustomerListPage } from './pages/CustomerListPage'
import { CustomerDetailPage } from './pages/CustomerDetailPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CustomerListPage />} />
        <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
      </Routes>
    </Layout>
  )
}

export default App
