import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import path from "path";

import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

/**
 * Client-public build defaults, committed at config/public-build-env.json.
 *
 * The Cloudflare Pages project carries no environment variables, so a
 * git-triggered build inlined an empty Supabase URL and the browser app died
 * on start with "supabaseUrl is required" - a blank page for every visitor.
 * Reading the values from the repository makes every build self-sufficient.
 *
 * Anything actually present in the environment still wins, so a real
 * environment variable or .env file overrides these defaults.
 */
function publicBuildDefaults(): Record<string, string> {
  const file = path.resolve(import.meta.dirname, "config/public-build-env.json");
  if (!fs.existsSync(file)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([key, value]) => key.startsWith("VITE_") && typeof value === "string" && value.length > 0
      )
    );
  } catch (error) {
    console.warn("[build] config/public-build-env.json could not be read:", error);
    return {};
  }
}

export default defineConfig(({ mode }) => {
  const defaults = publicBuildDefaults();
  const fromEnvFiles = loadEnv(mode, import.meta.dirname, "VITE_");
  const resolved: Record<string, string> = { ...defaults, ...fromEnvFiles };

  // Fail loudly at build time rather than shipping a client that cannot start.
  const missing = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"].filter((key) => !resolved[key]);
  if (missing.length > 0) {
    throw new Error(
      `Build refused: ${missing.join(", ")} not set. Add them to the environment or to config/public-build-env.json.`
    );
  }

  return {
    plugins: [dyadComponentTagger(), react()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    define: Object.fromEntries(
      Object.entries(resolved).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])
    ),
    build: {
      outDir: "dist",
    },
    server: {
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: "http://localhost:8788",
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        "/api": {
          target: "http://localhost:8788",
          changeOrigin: true,
        },
      },
    },
    appType: "spa",
    base: "/",
  };
});