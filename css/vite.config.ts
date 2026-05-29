import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// NOTE: placeholder survey-service target. Confirm the real host/prefix before
// wiring up data calls. Auth-only bootstrap currently uses just the /oauth2 proxy.
const CSS_API_TARGET = "https://css-api.retailsvc.com";
const CSS_API_PREFIX = "/api/v1";
const AUTH_TARGET = "https://auth.retailsvc.com";

export default defineConfig({
  plugins: [...react(), ...tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: CSS_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, CSS_API_PREFIX),
      },
      "/oauth2": {
        target: AUTH_TARGET,
        changeOrigin: true,
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
          });
        },
      },
    },
  },
});
