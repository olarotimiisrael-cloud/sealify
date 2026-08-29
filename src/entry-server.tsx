import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/cloudflare-pages";

// Import API routes
import { authRoutes } from "./api/auth";
import { listingsRoutes } from "./api/listings";
import { messagesRoutes } from "./api/messages";
import { notificationsRoutes } from "./api/notifications";
import { adminRoutes } from "./api/admin";
import { usersRoutes } from "./api/users";
import { categoriesRoutes } from "./api/categories";
import { buyerRequestsRoutes } from "./api/buyer-requests";
import { reviewsRoutes } from "./api/reviews";
import { searchRoutes } from "./api/search";
import { analyticsRoutes } from "./api/analytics";
import { pushRoutes } from "./api/push";
import { healthRoutes } from "./api/health";
import { copilotRoutes } from "./api/copilot";

type Env = {
  HYPERDRIVE: any;
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use("/*", cors({
  origin: [
    "https://sealify.ng",
    "https://www.sealify.ng",
    "https://sealify.pages.dev",
    "https://sealify.thesealconsult.com.ng",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Health check
app.route("/api", healthRoutes);

// API Routes
app.route("/api/auth", authRoutes);
app.route("/api/copilot", copilotRoutes);
app.route("/api/listings", listingsRoutes);
app.route("/api/users", usersRoutes);
app.route("/api/messages", messagesRoutes);
app.route("/api/notifications", notificationsRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/categories", categoriesRoutes);
app.route("/api/buyer-requests", buyerRequestsRoutes);
app.route("/api/reviews", reviewsRoutes);
app.route("/api/search", searchRoutes);
app.route("/api/analytics", analyticsRoutes);
app.route("/api/push", pushRoutes);

export const onRequest = handle(app);
