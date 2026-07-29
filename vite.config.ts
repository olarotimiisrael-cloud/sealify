import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [react(), nitro()],
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
});