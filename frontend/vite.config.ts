import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import path from "path";

/**
 * Client-public build defaults, committed at config/public-build-env.json.
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

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    define: Object.fromEntries(
      Object.entries(resolved).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])
    ),
    build: {
      // Build straight into the Laravel app's public directory so the whole
      // product ships as a single Laravel application (PHP + built SPA).
      // emptyOutDir is disabled on purpose: Laravel's index.php and .htaccess
      // live in that directory and must survive every build.
      outDir: "../sealify-backend/public",
      emptyOutDir: false,
    },
    server: {
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
    appType: "spa",
    base: "/",
  };
});