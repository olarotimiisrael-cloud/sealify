import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { nitro } from "nitro/vite";
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

export default defineConfig({
  plugins: [dyadComponentTagger(), react(), nitro()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    ssr: true,
    rollupOptions: {
      input: {
        main: "./index.html",
        server: "./src/entry-server.tsx",
      },
    },
  },
  ssr: {
    noExternal: ["@supabase/supabase-js", "postgres"],
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  base: "/",
});