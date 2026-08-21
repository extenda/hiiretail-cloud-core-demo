import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Swap to the test host when demoing with test-environment credentials; the
// OCMS token has to come from the auth service of the same environment.
const ECS_API_TARGET = "https://ecs-api.retailsvc.com";
// const ECS_API_TARGET = "https://ecs-api.retailsvc-test.com";
const ECS_API_PREFIX = "/api/v1";

const AUTH_TARGET = ECS_API_TARGET.includes("-test")
  ? "https://auth.retailsvc-test.com"
  : "https://auth.retailsvc.com";

// The header shows which environment the decisions came from.
const ECS_ENVIRONMENT = ECS_API_TARGET.includes("-test") ? "test" : "prod";

export default defineConfig({
  plugins: [...react(), ...tailwindcss()],
  define: {
    __ECS_ENVIRONMENT__: JSON.stringify(ECS_ENVIRONMENT),
  },
  server: {
    proxy: {
      "/api": {
        target: ECS_API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ECS_API_PREFIX),
      },
      "/oauth2": {
        target: AUTH_TARGET,
        changeOrigin: true,
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
          });
          // A rejected token request answers `WWW-Authenticate: Basic`, which
          // makes the browser pop its own credentials dialog and leaves the
          // fetch hanging instead of letting the login form report the failure.
          proxy.on("proxyRes", (proxyRes) => {
            delete proxyRes.headers["www-authenticate"];
          });
        },
      },
    },
  },
});
