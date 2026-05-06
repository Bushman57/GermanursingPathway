import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig(({ mode }) => {
  // For GitHub Pages we build with `--mode gh-pages` and set a repo subpath base.
  const base = mode === "gh-pages" ? "/germany-bound/" : "/";

  return {
    base,
    plugins: [TanStackRouterVite(), react(), tailwindcss(), tsconfigPaths()],
  };
});
