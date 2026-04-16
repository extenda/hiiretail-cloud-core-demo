import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const CRS_API_TARGET = "https://crs-api.retailsvc.com";
const CRS_API_PREFIX = "/api/v1";
const AUTH_TARGET = "https://auth.retailsvc.com";
const BUM_API_TARGET = "https://business-unit.retailsvc.com";
const BUM_API_PREFIX = "/api/v1";

export default defineConfig({
  plugins: [...react(), ...tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: CRS_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => {
          return path.replace(/^\/api/, CRS_API_PREFIX);
        },
      },
      "/bum-api": {
        target: BUM_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bum-api/, BUM_API_PREFIX),
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
