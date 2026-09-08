import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Prod for the demo. Coverage, format=raw and structured plurals are from HII-13642, which
// isn't on the service's master branch yet — if prod hasn't picked it up, those calls will
// 400/404 (and reads and everything downstream of them break, since every read here requests
// format=raw). Publishing here writes real data; swap back to staging for throwaway publish
// testing.
// const TRS_API_TARGET = "https://translation.retailsvc.dev";
const TRS_API_TARGET = "https://translation.retailsvc.com";
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
