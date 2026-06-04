import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
export default defineConfig(({ mode }) => ({
  base: mode === "gh-pages" ? "/germany-bound/" : "/",
  plugins: [TanStackRouterVite(), react(), tailwindcss(), tsconfigPaths()],
  server: {
    host: "::",
    port: 8080,
    // ngrok / tunnel URLs change per session; true allows any Host header in dev
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
}));
