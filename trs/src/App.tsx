import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ReadPage } from "./pages/ReadPage";
import { PublishPage } from "./pages/PublishPage";
import { TokensPage } from "./pages/TokensPage";
import { ResolutionPage } from "./pages/ResolutionPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ReadPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/how-it-resolves" element={<ResolutionPage />} />
        <Route path="/tokens" element={<TokensPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
