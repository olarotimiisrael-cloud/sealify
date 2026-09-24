import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

// Rate limiting store (in production, use Cloudflare KV or Durable Objects)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(options: {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) {
  const { windowMs, maxRequests, keyGenerator = (c) => c.req.header("cf-connecting-ip") || "unknown" } = options;

  return async (c: any, next: any) => {
    const key = `ratelimit:${keyGenerator(c)}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      throw new HTTPException(429, {
        message: "Too many requests, please try again later",
        headers: { "Retry-After": String(Math.max(1, Math.ceil((record.resetAt - now) / 1000))) },
      });
    }

    record.count++;
    return next();
  };
}

// Auth validation middleware
export async function requireAuth(c: any, next: any) {
  const env = c.env as any;
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Authorization header required" });
  }

  const token = authHeader.substring(7);
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }

  // Attach user to context
  c.set("user", user);
  c.set("supabase", supabase);
  return next();
}

// Server-side admin authorization helper.
// Primary path: Supabase PostgREST RPC -> public.is_admin() (SECURITY DEFINER,
// pinned search_path, decision tied to auth.uid()). This keeps administrator
// authorization independent of the Cloudflare HYPERDRIVE binding.
// Fallback path: direct SQL via Hyperdrive (still parameterized).
// Both paths evaluate the SAME database function; nothing client-supplied
// (email, role flags, localStorage) is ever trusted as proof of admin status.
export async function checkIsAdmin(
  env: any,
  accessToken: string,
  userId: string
): Promise<boolean | null> {
  const anonKey = env.SUPABASE_ANON_KEY;
  if (env.SUPABASE_URL && anonKey) {
    try {
      const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/is_admin`, {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: "{}",
      });
      if (res.ok) {
        const json = await res.json();
        return typeof json === "boolean" ? json : Boolean(json?.is_admin);
      }
      // Non-OK response: log the body type to diagnose HTML-vs-JSON issues.
      const contentType = res.headers.get("content-type") || "";
      const bodyPreview = await res.text().catch(() => "");
      console.error(
        `[auth] is_admin RPC via PostgREST returned HTTP ${res.status} ` +
        `content-type="${contentType}" body="${bodyPreview.slice(0, 200)}"`
      );
    } catch (err: any) {
      console.error("[auth] is_admin RPC call failed:", err?.message ?? err);
    }
  }

  try {
    const sql = getSql(env);
    // NOTE: use public.is_admin() here. The canonical zero-arg function that
    // checkIsAdmin() validates through PostgREST RPC lives in the public
    // schema (SECURITY DEFINER, pinned search_path, bound to auth.uid()).
    // private.is_admin() does not check status='active', so it must NOT be
    // used as the authorization source of truth on this path.
    // private.is_admin_for() remains the server-side helper (Hyperdrive /
    // service-role connections only; not callable over PostgREST).
    // public.is_admin(uuid) is deprecated and being dropped by migration
    // 20260923000000_secure_is_admin_hardening.sql.
    const rows = await sql`SELECT private.is_admin_for(${userId}) AS is_admin`;
    return Boolean(rows[0]?.is_admin);
  } catch (err: any) {
    console.error("[auth] is_admin Hyperdrive fallback failed:", err?.message ?? err);
    return null;
  }
}

// Admin role check middleware
export async function requireAdmin(c: any, next: any) {
  await requireAuth(c, async () => {
    const user = c.get("user");
    const token = c.req.header("Authorization").substring(7);

    // Authorization is decided by the database function only.
    // Do not trust a client-readable profile field as the authorization source.
    const admin = await checkIsAdmin(c.env, token, user.id);

    if (admin === null) {
      throw new HTTPException(503, { message: "Administrator authorization service temporarily unavailable" });
    }
    if (!admin) {
      throw new HTTPException(403, { message: "Admin access required" });
    }

    // Optional: expose a Hyperdrive client for handlers that need raw SQL.
    // Its absence must not block authorization above.
    try {
      c.set("sql", getSql(c.env));
    } catch {
      /* Hyperdrive unavailable - routes requiring it will fail individually */
    }
    c.set("profile", { role: "admin" });
    return next();
  });
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

// Request validation helper
export function validateRequest<T>(schema: { parse: (data: any) => T }) {
  return async (c: any, next: any) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);
      c.set("validatedBody", validated);
      return next();
    } catch (error) {
      throw new HTTPException(400, { message: "Invalid request body", cause: error });
    }
  };
}

// Security headers middleware (additional to _headers)
export function securityHeaders() {
  return async (c: any, next: any) => {
    await next();
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), payment=()");
  };
}

// CORS configuration
export function corsConfig() {
  return async (c: any, next: any) => {
    const origin = c.req.header("Origin");
    const allowedOrigins = [
      "https://sealify.ng",
      "https://www.sealify.ng",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ];

    if (origin && allowedOrigins.includes(origin)) {
      c.header("Access-Control-Allow-Origin", origin);
      c.header("Access-Control-Allow-Credentials", "true");
    }

    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    c.header("Access-Control-Max-Age", "86400");

    if (c.req.method === "OPTIONS") {
      return c.text("", 204);
    }

    return next();
  };
}

// Request size limit
export function requestSizeLimit(maxSize: number = 10 * 1024 * 1024) { // 10MB default
  return async (c: any, next: any) => {
    const contentLength = c.req.header("Content-Length");
    if (contentLength && parseInt(contentLength) > maxSize) {
      throw new HTTPException(413, { message: "Request entity too large" });
    }
    return next();
  };
}

// Audit logging helper
export async function auditLog(
  sql: ReturnType<typeof getSql>,
  userId: string,
  action: string,
  details: string,
  type: "security" | "user" | "listing" | "broadcast" | "verification" | "intrusion" | "dispute" | "finance" = "user",
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await sql`
      INSERT INTO audit_logs (action, details, type, user_id, ip_address, user_agent, created_at)
      VALUES (${action}, ${details}, ${type}, ${userId}, ${ipAddress || null}, ${userAgent || null}, NOW())
    `;
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}

// Intrusion logging for failed admin attempts
export async function logIntrusionAttempt(
  sql: ReturnType<typeof getSql>,
  attemptedEmail: string,
  request: Request,
  metadata: Record<string, any> = {}
) {
  const userAgent = request.headers.get("User-Agent") || "unknown";
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const deviceInfo = {
    userAgent,
    platform: request.headers.get("Sec-CH-UA-Platform") || "unknown",
    language: request.headers.get("Accept-Language") || "unknown",
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  await sql`
    INSERT INTO intrusion_logs (attempted_email, device_info, media_captured, media_status, status, ip_address, user_agent, created_at)
    VALUES (${attemptedEmail}, ${JSON.stringify(deviceInfo)}, false, 'N/A', 'flagged', ${ip}, ${userAgent}, NOW())
  `;
}


