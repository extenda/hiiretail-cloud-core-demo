import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import { App } from "./App";
import { bootstrap } from "./bootstrap";
import "./index.css";

const root = document.getElementById("root")!;

bootstrap().then(({ tenantId, languages, offline }) => {
  createRoot(root).render(
    <StrictMode>
      <I18nextProvider i18n={i18next}>
        <App tenantId={tenantId} languages={languages} offline={offline} />
      </I18nextProvider>
    </StrictMode>,
  );
});
