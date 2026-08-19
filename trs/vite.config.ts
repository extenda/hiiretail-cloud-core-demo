import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Staging carries a new endpoint before prod does — swap once prod has caught up.
const TRS_API_TARGET = "https://translation.retailsvc.dev";
// const TRS_API_TARGET = "https://translation.retailsvc.com";
const TRS_API_PREFIX = "/api/v1";

// A token is issued per environment, so the UI has to know which one it proxies to.
const TRS_ENVIRONMENT = TRS_API_TARGET.endsWith(".dev") ? "staging" : "prod";

export default defineConfig({
  plugins: [...react(), ...tailwindcss()],
  define: {
    __TRS_ENVIRONMENT__: JSON.stringify(TRS_ENVIRONMENT),
  },
  server: {
    proxy: {
      "/api": {
        target: TRS_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, TRS_API_PREFIX),
      },
    },
  },
});
