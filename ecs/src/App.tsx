import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ConditionsPage } from "./pages/ConditionsPage";
import { ProjectRestrictionsPage } from "./pages/ProjectRestrictionsPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CheckoutPage />} />
        <Route path="/conditions" element={<ConditionsPage />} />
        <Route
          path="/project-restrictions"
          element={<ProjectRestrictionsPage />}
        />
      </Routes>
    </Layout>
  );
}

export default App;
