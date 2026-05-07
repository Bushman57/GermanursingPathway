import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig(({ mode }) => ({
  base: mode === "gh-pages" ? "/germany-bound/" : "/",
  plugins: [TanStackRouterVite(), react(), tailwindcss(), tsconfigPaths()],
}));
