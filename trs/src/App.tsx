import { Navigate, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ModulesPage } from "./pages/ModulesPage";
import { TranslationsPage } from "./pages/TranslationsPage";
import { TokensPage } from "./pages/TokensPage";
import { useSelectedApp } from "./hooks/useSelectedApp";

// `/translations` alone has no module to show — send it to whichever module was last selected
// (defaulting to the first app), so the sidebar's nav entry always lands somewhere real.
function TranslationsIndexRedirect() {
  const [moduleId] = useSelectedApp();

  return <Navigate to={`/translations/${moduleId}`} replace />;
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ModulesPage />} />
        <Route path="/translations" element={<TranslationsIndexRedirect />} />
        <Route path="/translations/:moduleId" element={<TranslationsPage />} />
        <Route path="/tokens" element={<TokensPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
