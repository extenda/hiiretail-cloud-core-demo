import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { SurveyListPage } from './pages/SurveyListPage'
import { FillSurveyPage } from './pages/FillSurveyPage'
import { ResponsesPage } from './pages/ResponsesPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SurveyListPage />} />
        <Route path="/fill" element={<FillSurveyPage />} />
        <Route path="/surveys/:surveyId/responses" element={<ResponsesPage />} />
      </Routes>
    </Layout>
  )
}

export default App
