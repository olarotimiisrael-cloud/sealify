import { createRequestHandler } from "react-router";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/cloudflare-pages";

// Import API routes
import { authRoutes } from "./api/auth";
import { listingsRoutes } from "./api/listings";
import { usersRoutes } from "./api/users";
import { messagesRoutes } from "./api/messages";
import { notificationsRoutes } from "./api/notifications";
import { adminRoutes } from "./api/admin";
import { healthRoutes } from "./api/health";

type Env = {
  HYPERDRIVE: any;
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use("/*", cors({
  origin: ["https://sealify.ng", "https://www.sealify.ng", "http://localhost:5173"],
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Health check
app.route("/api", healthRoutes);

// API Routes
app.route("/api/auth", authRoutes);
app.route("/api/listings", listingsRoutes);
app.route("/api/users", usersRoutes);
app.route("/api/messages", messagesRoutes);
app.route("/api/notifications", notificationsRoutes);
app.route("/api/admin", adminRoutes);

// React Router SSR handler for all other routes
const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build") as Promise<any>,
  import.meta.env.MODE
);

app.all("*", async (c) => {
  const response = await requestHandler(c.req.raw, {
    env: c.env,
    ctx: c.executionCtx
  });
  return response;
});

export const onRequest: any = handle(app);