import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Same host the management app (../..) points at — see its vite.config.ts for the
// staging/prod tradeoff. Consumer reads are anonymous either way.
const API_TARGET = "https://translation.retailsvc.com";
const API_PREFIX = "/api/v1";

export default defineConfig({
  plugins: [...react(), ...tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, API_PREFIX),
      },
    },
  },
});
