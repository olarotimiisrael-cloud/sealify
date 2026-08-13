import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

export default defineConfig({
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  base: "/",
});
