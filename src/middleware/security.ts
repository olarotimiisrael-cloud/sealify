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
      throw new HTTPException(429, { message: "Too many requests, please try again later" });
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
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }

  // Attach user to context
  c.set("user", user);
  c.set("supabase", supabase);
  return next();
}

// Admin role check middleware
export async function requireAdmin(c: any, next: any) {
  await requireAuth(c, async () => {
    const user = c.get("user");
    const sql = getSql(c.env);

    // Authorization is evaluated by the production private-schema helper.
    // Do not trust a client-readable profile field as the authorization source.
    const result = await sql`SELECT private.is_admin(${user.id}) AS is_admin`;

    if (!result[0]?.is_admin) {
      throw new HTTPException(403, { message: "Admin access required" });
    }

    c.set("sql", sql);
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