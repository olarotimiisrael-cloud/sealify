import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, sanitizeInput, auditLog, logIntrusionAttempt, checkIsAdmin } from "../middleware/security";
import { z } from "zod";
import { parseUserAgent } from "../utils/userAgent";

export const authRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql> } }>();

// SECURITY / API-CONTRACT GUARD: every error thrown anywhere in this route tree
// (including HTTPException raised by shared middleware such as rate limiting)
// MUST be serialized as JSON. Hono's default exception handler responds with
// text/plain, which breaks clients that parse the response body as JSON.
authRoutes.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status as 400);
  }
  console.error("[auth] Unhandled error:", err instanceof Error ? err.message : String(err));
  return c.json({ error: "Internal server error" }, 500);
});

async function sha256Hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  fullName: z.string().min(2, "Name too short").max(100).regex(/^[a-zA-Z\s'-]+$/, "Invalid name format"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional(),
  referralCode: z.string().max(12).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password required"),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  businessName: z.string().max(100).optional().nullable(),
  businessCategory: z.string().max(50).optional().nullable(),
  businessAddress: z.string().max(200).optional().nullable(),
  bankName: z.string().max(100).optional().nullable(),
  accountNumber: z.string().max(20).optional().nullable(),
  accountName: z.string().max(100).optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  instagramHandle: z.string().max(50).optional().nullable(),
  twitterHandle: z.string().max(50).optional().nullable(),
  whatsappNumber: z.string().max(20).optional().nullable(),
  emailNotifications: z.boolean().optional(),
  whatsappNotifications: z.boolean().optional(),
  hidePhonePublicly: z.boolean().optional(),
  hideLocationPublicly: z.boolean().optional(),
  referralCode: z.string().max(12).optional(),
});

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 }); // 10 req/15min

/**
 * Record a new-user signup alert so administrators are notified in a timely
 * manner and can make follow-up calls. Best-effort: a database failure must
 * never turn a successful registration into an error response.
 */
async function recordSignupAlert(sql: any, c: any, profile: { id: string; email: string; full_name?: string | null; phone_number?: string | null; location?: string | null; role?: string | null }, channel: string) {
  try {
    const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "unknown";
    const ua = c.req.header("User-Agent") || "unknown";
    await sql`
      INSERT INTO admin_signup_alerts (user_id, email, full_name, phone_number, location, role, signup_channel, ip_address, user_agent, follow_up_status, created_at)
      VALUES (${profile.id}, ${profile.email}, ${profile.full_name || null}, ${profile.phone_number || null}, ${profile.location || null}, ${profile.role || 'buyer'}, ${channel}, ${ip}, ${ua}, 'pending', NOW())
    `;
  } catch (error) {
    console.error("[AUTH] Signup alert recording skipped (database unavailable):", (error as Error).message);
  }
}

/**
 * Record a successful administrator login session for the audit log. Best-effort:
 * must never block returning the session to the client.
 */
async function recordAdminLoginSession(sql: any, c: any, user: { id: string; email: string }, accessMethod: string, sessionId?: string | null) {
  try {
    const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "unknown";
    const ua = c.req.header("User-Agent") || "unknown";
    const parsed = parseUserAgent(ua);

    // Cloudflare provides best-effort geo headers; they are absent on some
    // requests (localhost, certain proxies), so every field is nullable.
    const country = c.req.header("CF-IPCountry") || null;
    const region = c.req.header("CF-Region") || null;
    const city = c.req.header("CF-City") || null;
    const latHeader = c.req.header("CF-Latitude");
    const lonHeader = c.req.header("CF-Longitude");
    const latitude = latHeader ? Number(latHeader) : null;
    const longitude = lonHeader ? Number(lonHeader) : null;

    const result = await sql`
      INSERT INTO admin_login_sessions
        (admin_id, email, ip_address, country, region, city, latitude, longitude,
         browser_name, browser_version, os_name, os_version, device_type, device_brand,
         device_model, access_method, session_token_id, user_agent, status, created_at, updated_at)
      VALUES (${user.id}, ${user.email}, ${ip}, ${country}, ${region}, ${city}, ${latitude}, ${longitude},
              ${parsed.browserName}, ${parsed.browserVersion}, ${parsed.osName}, ${parsed.osVersion},
              ${parsed.deviceType}, ${parsed.deviceBrand}, ${parsed.deviceModel}, ${accessMethod},
              ${sessionId || null}, ${ua}, 'logged_in', NOW(), NOW())
      RETURNING id
    `;

    // Best-effort denormalized pointer on the profile for quick "last login" reads.
    await sql`
      UPDATE profiles SET last_login_at = NOW(), last_login_ip = ${ip} WHERE id = ${user.id}
    `;

    return result[0]?.id || null;
  } catch (error) {
    console.error("[AUTH] Admin login session recording skipped (database unavailable):", (error as Error).message);
    return null;
  }
}

/**
 * Mark an existing admin login session as logged out and compute its
 * duration. Best-effort: must never block a logout response.
 */
async function recordAdminLogout(sql: any, user: { id: string; email: string }) {
  try {
    const session = await sql`
      SELECT id, login_at FROM admin_login_sessions
      WHERE admin_id = ${user.id} AND status = 'logged_in'
      ORDER BY login_at DESC LIMIT 1
    `;
    if (!session.length) return;

    const loginAt = new Date(session[0].login_at).getTime();
    const duration = Math.max(0, Math.round((Date.now() - loginAt) / 1000));

    await sql`
      UPDATE admin_login_sessions
      SET status = 'logged_out', logout_at = NOW(), session_duration_seconds = ${duration},
          last_activity_at = NOW(), updated_at = NOW()
      WHERE id = ${session[0].id}
    `;
  } catch (error) {
    console.error("[AUTH] Admin logout recording skipped (database unavailable):", (error as Error).message);
  }
}

// This is deliberately keyed by normalized email, not browser state or IP.
// Supabase Auth remains the credential authority; intrusion_logs makes the
// temporary throttle durable across browser refreshes and Worker instances.
const ADMIN_LOGIN_COOLDOWN_MS = 5 * 60 * 1000;
const ADMIN_LOGIN_MAX_FAILURES = 5;

const genericAdminLoginError = () => new HTTPException(401, { message: "Unable to authenticate administrator" });

/**
 * Referral helpers. Every user gets a permanent referral code on signup so
 * they can refer others, and a referral is credited to the referrer via the
 * database function credit_referral() (atomic: referral row + cached counter
 * in one transaction). The referral code is minted server-side, never
 * client-controlled, so a client cannot forge or guess another user's code.
 */
const REFERRAL_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function mintReferralCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let out = "";
  for (const b of bytes) out += REFERRAL_CODE_ALPHABET[b % REFERRAL_CODE_ALPHABET.length];
  return `SEALIFY-${out}`;
}

async function ensureReferralCode(sql: ReturnType<typeof getSql>, userId: string): Promise<string> {
  const rows = await sql`SELECT referral_code FROM profiles WHERE id = ${userId}`;
  if (rows.length && rows[0].referral_code) return rows[0].referral_code;

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = mintReferralCode();
    try {
      const result = await sql`
        UPDATE profiles SET referral_code = ${code}, referral_count = 0, referral_cycle = 1
        WHERE id = ${userId} AND referral_code IS NULL
        RETURNING referral_code
      `;
      if (result.length) return result[0].referral_code;
    } catch (err: any) {
      // unique violation on the code -> retry with a fresh code
      if (err?.code !== "23505") throw err;
    }
  }
  throw new HTTPException(500, { message: "Failed to generate referral code" });
}

async function creditReferral(sql: ReturnType<typeof getSql>, refereeId: string, referralCode?: string, ip?: string | null, userAgent?: string | null): Promise<string | null> {
  if (!referralCode) return null;
  try {
    const result = await sql`
      SELECT public.credit_referral(
        ${refereeId},
        ${referralCode},
        ${ip || null},
        ${userAgent || null}
      ) AS referral_id
    `;
    return result[0]?.referral_id || null;
  } catch (err: any) {
    console.error("[AUTH] credit_referral failed:", err?.message ?? err);
    return null;
  }
}

async function dispatchWelcomeEmail(env: any, c: any, userId: string) {
  try {
    const baseUrl = c.req.url.replace(/\/api\/auth\/register$/, "");
    const res = await fetch(`${baseUrl}/api/email/welcome`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      console.warn("[AUTH] Welcome email dispatch failed:", await res.text().catch(() => ""));
    }
  } catch (err: any) {
    console.warn("[AUTH] Welcome email dispatch error:", err?.message ?? err);
  }
}

// Register
authRoutes.post("/register", authRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();

    // Validate input
    const validated = registerSchema.parse(body);
    const { email, password, fullName, phoneNumber, referralCode } = validated;

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);
    const sql = getSql(env);

    // Check if user already exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      throw new HTTPException(409, { message: "Email already registered" });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: sanitizeInput(fullName),
          phone: phoneNumber,
        }
      }
    });

    if (authError) {
      throw new HTTPException(400, { message: authError.message });
    }

    if (!authData.user) {
      throw new HTTPException(500, { message: "Failed to create user" });
    }

    const userId = authData.user.id;

    // Create profile in database
    await sql`
      INSERT INTO profiles (id, email, full_name, phone_number, role, status, location, verified, verification_type, created_at, updated_at)
      VALUES (${userId}, ${email}, ${sanitizeInput(fullName)}, ${phoneNumber || null}, 'buyer', 'active', 'Ogbomoso, Oyo State', false, 'none', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone_number = EXCLUDED.phone_number,
        updated_at = NOW()
    `;

    // Create user settings
    await sql`
      INSERT INTO user_settings (user_id, email_notifications, whatsapp_notifications, push_notifications, price_drop_alerts, new_message_alerts, weekly_digest, promotion_expiry_reminders, language, theme, created_at, updated_at)
      VALUES (${userId}, true, true, true, true, true, true, true, 'en', 'dark', NOW(), NOW())
      ON CONFLICT (user_id) DO NOTHING
    `;

    await auditLog(getSql(c.env), userId, "User Registered", `New user registered: ${email}`, "user");

    // Ensure the new user has their own referral code (they can refer others).
    const ownReferralCode = await ensureReferralCode(getSql(c.env), userId);

    // Credit the referrer if this signup was referred. Best-effort: a referral
    // failure must never turn a successful registration into an error.
    await creditReferral(getSql(c.env), userId, referralCode, c.req.header("CF-Connecting-IP"), c.req.header("User-Agent"));

    // Dispatch the welcome email (best-effort, never blocks the 201 response).
    await dispatchWelcomeEmail(env, c, userId);

    // Notify administrators of the new signup so they can make a timely
    // follow-up call. Best-effort: never blocks the registration response.
    await recordSignupAlert(getSql(c.env), c, {
      id: userId,
      email,
      full_name: sanitizeInput(fullName),
      phone_number: phoneNumber || null,
      location: 'Ogbomoso, Oyo State',
      role: 'buyer',
    }, 'email');

    return c.json({
      user: {
        id: userId,
        email,
        fullName: sanitizeInput(fullName),
        phoneNumber,
        role: "buyer",
        verified: false,
        referralCode: ownReferralCode,
      },
      session: authData.session
    }, 201);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: "Validation failed", cause: error.errors });
    }
    console.error("Registration error:", error);
    throw new HTTPException(500, { message: "Registration failed" });
  }
});

// Identify an identifier (email or phone) and trigger verification if needed.
authRoutes.post("/identify", authRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const { identifier } = body as { identifier?: string };

    if (!identifier || typeof identifier !== "string") {
      throw new HTTPException(400, { message: "identifier is required" });
    }

    const isEmail = identifier.includes("@");
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);

    let profile: any = null;
    if (isEmail) {
      const { data } = await supabase.from("profiles").select("id, verified, email").eq("email", identifier.trim().toLowerCase()).maybeSingle();
      profile = data;
    } else {
      const clean = identifier.replace(/\D/g, "");
      const { data } = await supabase.from("profiles").select("id, verified, phone_number").eq("phone_number", clean).maybeSingle();
      profile = data;
    }

    if (!profile) {
      return c.json({ status: "not_found" });
    }

    if (profile.verified) {
      return c.json({ status: "recognized_verified" });
    }

    // Not verified yet – send verification depending on channel
    if (isEmail) {
      const email = identifier.trim().toLowerCase();
      const origin = c.req.header("origin") || env.PUBLIC_SITE_URL || env.APP_URL || "http://localhost:5173";
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/verify-email` },
      });
      if (error) throw new HTTPException(500, { message: "Failed to send verification email" });
      return c.json({ status: "recognized_unverified", channel: "email", method: "magic_link" });
    } else {
      // Phone OTP – self-contained: generate OTP and store locally
      const phone = profile.phone_number;
      if (!phone) {
        throw new HTTPException(400, { message: "Phone number missing for verification" });
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpId = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await supabase.from("phone_otps").upsert(
        { phone_number: phone.replace(/\D/g, ""), otp_hash: await sha256Hash(otp), expires_at: expiresAt, delivered_via: 'in_app' },
        { onConflict: "phone_number" }
      );
      return c.json({ status: "recognized_unverified", channel: "phone", method: "otp", otpId, otp });
    }
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Identify error:", error);
    throw new HTTPException(500, { message: "Identification failed" });
  }
});

// Profile completion for OAuth users who lack required fields.
authRoutes.post("/profile-complete", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    const body = await c.req.json();
    const validated = updateProfileSchema.parse(body);
    const sql = getSql(c.env);

    const updates: any = { updated_at: new Date() };
    for (const field of Object.keys(validated)) {
      if (validated[field as keyof typeof validated] !== undefined) {
        updates[field] = validated[field as keyof typeof validated];
      }
    }

    // Sanitize string fields
    for (const key of Object.keys(updates)) {
      if (typeof updates[key] === 'string') {
        updates[key] = sanitizeInput(updates[key]);
      }
    }

    // Mark profile as verified once required fields are present
    const hasRequired = Boolean(validated.fullName) && Boolean(validated.phoneNumber);
    if (hasRequired) {
      updates.verified = true;
    }

    const setEntries = Object.entries(updates).filter(([key]) => key !== "updated_at");
    const setClause = setEntries.map(([key], i) => `${key} = $${i + 1}`).join(", ");
    const values = setEntries.map(([, value]) => value);

    await sql.unsafe(`
      UPDATE profiles SET ${setClause}, updated_at = NOW() WHERE id = $${values.length + 1}
    `, [...values, user.id]);

    await auditLog(getSql(c.env), user.id, "Profile Completed", "OAuth user completed profile", "user");

    // Ensure the user has their own referral code (they can refer others).
    const ownReferralCode = await ensureReferralCode(getSql(c.env), user.id);

    // Credit the referrer if this signup was referred. Best-effort.
    await creditReferral(getSql(c.env), user.id, validated.referralCode, c.req.header("CF-Connecting-IP"), c.req.header("User-Agent"));

    const updated = await sql`SELECT * FROM profiles WHERE id = ${user.id}`;
    return c.json({ user: { ...updated[0], referralCode: ownReferralCode } });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: "Validation failed", cause: error.errors });
    }
    console.error("Profile complete error:", error);
    throw new HTTPException(500, { message: "Failed to complete profile" });
  }
});
// Admin login.
// Architecture contract:
//   1. Supabase Auth (GoTrue) is the ONLY credential authority.
//   2. Administrator authorization is decided by the database function
//      public.is_admin() via PostgREST RPC, evaluated under the caller's own
//      JWT - never by email matching, client flags, or frontend state.
//   3. HYPERDRIVE is strictly optional here: rate-limit bookkeeping, intrusion
//      logging and audit logging are best-effort. Their failure must NEVER
//      turn a valid administrator login into an error response.
authRoutes.post("/admin-login", async (c) => {
  const env = c.env as any;

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.error("[ADMIN LOGIN] Server misconfiguration: SUPABASE_URL / SUPABASE_ANON_KEY missing");
    throw new HTTPException(503, { message: "Authentication service is not configured" });
  }

  // Validate service role key format. Supabase service role keys
  // use the newer "sb_secret_" prefix; older keys may use "sb_service_role_".
  // Accept both formats — the actual validity is confirmed by the service
  // responding correctly to authentication requests, not by prefix inspection.
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const validKeyPrefixes = ["sb_service_role_", "sb_secret_"];
  if (serviceKey && !validKeyPrefixes.some(p => serviceKey.startsWith(p))) {
    console.error(`[ADMIN LOGIN] SUPABASE_SERVICE_ROLE_KEY has unrecognized prefix`);
    throw new HTTPException(503, { message: "Authentication service is not configured" });
  }

  const body = await c.req.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) throw genericAdminLoginError();

  const email = parsed.data.email.trim().toLowerCase();

  // Best-effort durable lockout check (Hyperdrive). If Hyperdrive is down we
  // skip this layer; per-isolate in-memory rate limiting and Supabase Auth's
  // own brute-force protection still apply. A temporary infrastructure
  // outage must never lock a legitimate administrator out.
  try {
    const sql = getSql(env);
    const recentFailures = await sql`
      SELECT COUNT(*)::int AS count, MAX(created_at) AS latest
      FROM intrusion_logs
      WHERE attempted_email = ${email}
        AND status = 'flagged'
        AND created_at >= NOW() - INTERVAL '15 minutes'
    `;
    const latestFailure = recentFailures[0]?.latest ? new Date(recentFailures[0].latest).getTime() : 0;
    if (Number(recentFailures[0]?.count || 0) >= ADMIN_LOGIN_MAX_FAILURES
        && Date.now() - latestFailure < ADMIN_LOGIN_COOLDOWN_MS) {
      throw new HTTPException(429, {
        message: "Too many authentication attempts. Please try again later.",
        headers: { "Retry-After": String(Math.ceil(ADMIN_LOGIN_COOLDOWN_MS / 1000)) },
      });
    }
  } catch (rateLimitError) {
    if (rateLimitError instanceof HTTPException) throw rateLimitError;
    console.error("[ADMIN LOGIN] Optional rate-limit check skipped (database unavailable):", (rateLimitError as Error).message);
  }

  // Step 1: Authenticate credentials through Supabase Auth. No database dependency.
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  // Step 2: Invalid credentials -> generic 401 (no user enumeration), plus
  // best-effort intrusion logging that can never change the response.
  if (error || !data.user || !data.session) {
    try {
      await logIntrusionAttempt(getSql(env), email, c.req.raw, { reason: "admin_authentication_failed" });
    } catch {
      // Database unavailable - still return generic error, do not leak details
    }
    throw genericAdminLoginError();
  }

  // Step 3: Verify administrator authorization via the database function.
  // Primary path is PostgREST RPC bound to the caller's JWT (no Hyperdrive);
  // Hyperdrive is only a fallback. Only when BOTH paths fail do we treat it
  // as infrastructure unavailability - and even then the just-created
  // session is revoked so no orphaned authenticated session lingers.
  const admin = await checkIsAdmin(env, data.session.access_token, data.user.id);

  if (admin === null) {
    console.error("[ADMIN LOGIN] Authorization could not be determined via RPC or Hyperdrive");
    await supabase.auth.signOut().catch(() => undefined);
    throw new HTTPException(503, { message: "Administrator authorization service temporarily unavailable" });
  }

  // Step 4: Authenticated but not an administrator -> revoke + 403.
  if (!admin) {
    await supabase.auth.signOut().catch(() => undefined);
    try {
      await logIntrusionAttempt(getSql(env), email, c.req.raw, { reason: "admin_authorization_failed" });
    } catch {
      // Optional security logging failed - does not affect the 403 outcome.
    }
    throw new HTTPException(403, { message: "Administrator access required" });
  }

  // Step 5: Success. Clear flagged intrusion rows and write an audit entry on
  // a best-effort basis. These MUST NOT block returning the session.
  try {
    const sql = getSql(env);
    await sql`
      UPDATE intrusion_logs
      SET status = 'dismissed'
      WHERE attempted_email = ${email}
        AND status = 'flagged'
        AND created_at >= NOW() - INTERVAL '15 minutes'
    `;
    await auditLog(sql, data.user.id, "Admin Login", "Successful administrator authentication", "security");
    // Record the detailed login session for the audit log (best-effort).
    await recordAdminLoginSession(sql, c, { id: data.user.id, email: data.user.email || email }, 'password', data.session?.access_token ? null : null);
  } catch (dbError) {
    console.error("[ADMIN LOGIN] Optional success logging skipped (database unavailable):", (dbError as Error).message);
  }

  return c.json({ session: data.session });
});

// Login
authRoutes.post("/login", authRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const validated = loginSchema.parse(body);
    const { email, password } = validated;

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);
    const sql = getSql(c.env);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      await auditLog(sql, "unknown", "Login Failed", `Failed login attempt for ${email}`, "security");
      throw new HTTPException(401, { message: error.message });
    }

    // Get user profile from database
    const profile = await sql`
      SELECT * FROM profiles WHERE id = ${data.user.id}
    `;

    await auditLog(sql, data.user.id, "User Login", `Successful login for ${email}`, "user");

    return c.json({
      user: profile[0] || {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name,
        role: "buyer"
      },
      session: data.session
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: "Validation failed", cause: error.errors });
    }
    console.error("Login error:", error);
    throw new HTTPException(500, { message: "Login failed" });
  }
});

// Get current user profile
authRoutes.get("/me", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    const sql = getSql(c.env);
    const profile = await sql`
      SELECT * FROM profiles WHERE id = ${user.id}
    `;

    return c.json({ user: profile[0] || null });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Get user error:", error);
    throw new HTTPException(500, { message: "Failed to get user" });
  }
});

// Update user profile
authRoutes.put("/profile", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    const body = await c.req.json();
    const validated = updateProfileSchema.parse(body);
    const sql = getSql(c.env);

    const allowedFields = [
      'full_name', 'phone_number', 'avatar_url', 'store_banner_url',
      'bio', 'location', 'business_name', 'cac_number', 'business_hours',
      'bank_name', 'account_number', 'account_name',
      'website_url', 'instagram_handle', 'twitter_handle', 'whatsapp_number',
      'email_notifications', 'whatsapp_notifications', 'hide_phone_publicly', 'hide_location_publicly'
    ];

    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if (validated[field as keyof typeof validated] !== undefined) {
        updates[field] = validated[field as keyof typeof validated];
      }
    }

    // Sanitize string fields
    for (const key of Object.keys(updates)) {
      if (typeof updates[key] === 'string') {
        updates[key] = sanitizeInput(updates[key]);
      }
    }

    const setEntries = Object.entries(updates).filter(([key]) => key !== "updated_at");
    const setClause = setEntries.map(([key], i) => `${key} = $${i + 1}`).join(", ");
    const values = setEntries.map(([, value]) => value);

    await sql.unsafe(`
      UPDATE profiles SET ${setClause}, updated_at = NOW() WHERE id = $${values.length + 1}
    `, [...values, user.id]);

    await auditLog(getSql(c.env), user.id, "Profile Updated", "User updated their profile", "user");

    const updated = await sql`SELECT * FROM profiles WHERE id = ${user.id}`;
    return c.json({ user: updated[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: "Validation failed", cause: error.errors });
    }
    console.error("Update profile error:", error);
    throw new HTTPException(500, { message: "Failed to update profile" });
  }
});

// Logout
authRoutes.post("/logout", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser(token);
    await supabase.auth.signOut();

    // Record the logout + computed session duration in the audit log.
    // Best-effort: must never block the logout response.
    if (user) {
      try {
        await recordAdminLogout(getSql(c.env), c, { id: user.id, email: user.email || '' });
      } catch {
        // Database unavailable - logout still succeeds.
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    throw new HTTPException(500, { message: "Logout failed" });
  }
});

// Request password reset (with NIN verification)
authRoutes.post("/password/reset-request", authRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const { email, nin, idDocumentUrl, reason } = body;

    if (!email || !nin || !idDocumentUrl || !reason) {
      throw new HTTPException(400, { message: "All fields required" });
    }

    const sql = getSql(c.env);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("email", email)
      .single();

    if (!profile) {
      return c.json({ success: true, message: "If the email exists, a reset request has been queued" });
    }

    await sql`
      INSERT INTO password_requests (user_id, user_email, user_name, nin, id_document_url, new_password_hash, reason, status, created_at, updated_at)
      VALUES (${profile.id}, ${email}, ${profile.full_name}, ${nin}, ${idDocumentUrl}, 'SECURE_RESET_REQUIRED', ${reason}, 'pending', NOW(), NOW())
    `;

    try {
      // Fall back to the host this request actually arrived on. A hardcoded
      // domain silently sends password-reset links to a site the user does not
      // use, and the link then fails with no visible error.
      const requestOrigin = new URL(c.req.url).origin;
      const redirectBase = env.APP_URL || env.PUBLIC_SITE_URL || requestOrigin;
      const resetUrl = `${redirectBase}/reset-password`;
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: resetUrl });

      // Multi-channel dispatch: email + SMS + WhatsApp
      try {
        const baseUrl = c.req.url.replace(/\/api\/auth\/password\/reset-request$/, '');
        const emailResponse = await fetch(`${baseUrl}/api/email/password-reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            fullName: profile.full_name,
            resetUrl,
            phoneNumber: profile.phone_number || null,
            whatsappNumber: profile.whatsapp_number || null,
            channels: ['email', 'sms', 'whatsapp'],
          }),
        });
        if (!emailResponse.ok) {
          console.warn("Multi-channel password reset dispatch failed:", await emailResponse.text().catch(() => ''));
        }
      } catch (channelError) {
        console.warn("Multi-channel dispatch error:", channelError);
      }
    } catch (resetError) {
      console.warn("Password reset email dispatch failed - request still recorded for admin review:", resetError);
    }

    await auditLog(getSql(c.env), profile.id, "Password Reset Requested", `Password reset requested for ${email}`, "security");

    return c.json({ success: true, message: "Password reset request submitted for admin review" });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Password reset request error:", error);
    throw new HTTPException(500, { message: "Failed to process request" });
  }
});

// Send phone OTP
authRoutes.post("/phone/otp", authRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const { phone, channel = 'sms' } = body;

    if (!phone) {
      throw new HTTPException(400, { message: "Phone number required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpId = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const otpHash = await sha256Hash(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);

    // Clean up old OTPs for this phone number
    await supabase
      .from("phone_otps")
      .delete()
      .eq("phone_number", phone.replace(/\D/g, ''))
      .gt("created_at", new Date(Date.now() - 60 * 60 * 1000));

    // Store OTP hash only — never store plaintext
    const { error } = await supabase
      .from("phone_otps")
      .insert({
        phone_number: phone.replace(/\D/g, ''),
        otp_hash: otpHash,
        expires_at: expiresAt,
        delivered_via: 'in_app',
        attempts: 0,
      });

    if (error) {
      console.error("Failed to insert phone OTP:", error);
      throw new HTTPException(500, { message: "Failed to create OTP" });
    }

    // Self-contained: OTP is returned for in-app display (development)
    // Production deployments can extend this to send via email
    return c.json({ success: true, message: "OTP sent", otpId, otp });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Send OTP error:", error);
    throw new HTTPException(500, { message: "Failed to send OTP" });
  }
});

// Verify phone OTP
authRoutes.post("/phone/verify", authRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const { phone, otp, otpId } = body;

    if (!phone || !otp) {
      throw new HTTPException(400, { message: "Phone and OTP required" });
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);
    
    // Check the latest unverified OTP for this phone number
    const { data: otpRecord, error } = await supabase
      .from("phone_otps")
      .select("*")
      .eq("phone_number", phone.replace(/\D/g, ''))
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !otpRecord) {
      throw new HTTPException(400, { message: "No OTP found for this phone number" });
    }

    // Check if OTP has already been used
    if (otpRecord.used_at) {
      throw new HTTPException(400, { message: "OTP has already been used" });
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);
    if (now > expiresAt) {
      throw new HTTPException(400, { message: "OTP has expired" });
    }

    // Verify OTP hash using Web Crypto API
    const storedHash = otpRecord.otp_hash;
    const inputHash = await sha256Hash(otp);
    
    if (storedHash !== inputHash) {
      // Increment attempt counter
      await supabase
        .from("phone_otps")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      if (otpRecord.attempts >= 3) {
        throw new HTTPException(400, { message: "Too many failed attempts. Try again later." });
      }
      throw new HTTPException(400, { message: "Invalid OTP code" });
    }

    // Mark OTP as used
    await supabase
      .from("phone_otps")
      .update({ used_at: now.toISOString() })
      .eq("id", otpRecord.id);

    return c.json({ success: true, message: "Phone verified" });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Verify OTP error:", error);
      throw new HTTPException(500, { message: "Verification failed" });
  }
});

// ===========================================================
// PILLAR 1: Verification & Trust API
// ===========================================================

// GET /badges - list available verification badges (public)
authRoutes.get("/verification/badges", async (c) => {
  try {
    const sql = getSql(c.env);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);

    const { data: badges } = await sql`
      SELECT * FROM public.verification_badges
      ORDER BY name ASC
    `;

    return c.json({ badges: badges || [] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Get badges error:", error);
    throw new HTTPException(500, { message: "Failed to fetch badges" });
  }
});

// POST /verification-request - create a new verification request
authRoutes.post("/verification/request", rateLimit({ windowMs: 600000, maxRequests: 5 }), async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !authUser) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    const body = await c.req.json();
    const { badgeId, credentialId, issuer, credentialFileUrl, requestNotes } = body as any;

    if (!badgeId) throw new HTTPException(400, { message: "Badge ID is required" });

    const sql = getSql(c.env);
    const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);

    // Verify badge exists
    const { data: badge } = await sql`
      SELECT * FROM public.verification_badges WHERE id = ${badgeId}
    `;

    if (!badge) throw new HTTPException(404, { message: "Badge not found" });

    // Check if user already has this credential verified
    const { data: existing } = await supabaseClient
      .from("credential_verifications")
      .select("id")
      .eq("user_id", authUser.id)
      .eq("credential_id", credentialId)
      .maybeSingle();

    if (existing && existing.status !== 'rejected') {
      throw new HTTPException(409, { message: "This credential is already verified or pending verification" });
    }

    // Create verification request
    const { data: request } = await sql`
      INSERT INTO public.verification_requests
        (user_id, badge_id, status, request_data, created_at, updated_at)
      VALUES (${authUser.id}, ${badgeId}, 'pending', ${JSON.stringify({
        credentialId,
        issuer,
        credentialFileUrl,
        notes: requestNotes,
        requested_at: new Date().toISOString(),
      })}, NOW(), NOW())
      RETURNING *
    `;

    // Also record the credential verification attempt (if credential_id provided)
    if (credentialId) {
      await supabaseClient
        .from("credential_verifications")
        .insert({
          user_id: authUser.id,
          badge_id: badgeId,
          credential_id: credentialId,
          issuer: issuer,
          verification_date: new Date().toISOString(),
          verification_status: 'pending',
          credential_file_url: credentialFileUrl,
          verification_issued_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    await auditLog(sql, authUser.id, "Verification Request Created", `Requested ${badge.name} verification`, "verification");

    return c.json({ request: request[0], message: "Verification request submitted successfully" });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Verification request error:", error);
    throw new HTTPException(500, { message: "Failed to submit verification request" });
  }
});

// GET /verification-requests - list user's verification requests
authRoutes.get("/verification/requests", rateLimit({ windowMs: 600000, maxRequests: 10 }), async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !authUser) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    const sql = getSql(c.env);

    const { data: requests } = await sql`
      SELECT vr.*, vb.name as badge_name, vb.type as badge_type
      FROM public.verification_requests vr
      LEFT JOIN public.verification_badges vb ON vb.id = vr.badge_id
      WHERE vr.user_id = ${authUser.id}
      ORDER BY vr.created_at DESC
    `;

    return c.json({ requests: requests || [] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Get verification requests error:", error);
    throw new HTTPException(500, { message: "Failed to fetch verification requests" });
  }
});

// ===========================================================
// PILLAR 6: Viral Marketing & Social Integration API
// ===========================================================

// GET /share-links - list user's shareable links
authRoutes.get("/share-links", rateLimit({ windowMs: 600000, maxRequests: 10 }), async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !authUser) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    const sql = getSql(c.env);

    const { data: links } = await sql`
      SELECT sl.*,
        CASE WHEN sl.content_type = 'ad' THEN a.title END as content_title,
        CASE WHEN sl.content_type = 'profile' THEN p.full_name END as content_name
      FROM public.shareable_links sl
      LEFT JOIN public.ads a ON a.id::text = sl.content_id AND sl.content_type = 'ad'
      LEFT JOIN public.profiles p ON p.id::text = sl.content_id AND sl.content_type = 'profile'
      WHERE sl.user_id = ${authUser.id}
      ORDER BY sl.created_at DESC
      LIMIT 100
    `;

    return c.json({ links: links || [] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Get share links error:", error);
    throw new HTTPException(500, { message: "Failed to fetch share links" });
  }
});

// POST /share-link - create a new shareable link
authRoutes.post("/share-link", rateLimit({ windowMs: 600000, maxRequests: 20 }), async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !authUser) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    const body = await c.req.json();
    const { contentType, contentId, platform, referralCode, expiresAt } = body as any;

    if (!contentType || !contentId || !platform) {
      throw new HTTPException(400, { message: "content_type, content_id, and platform are required" });
    }

    const sql = getSql(c.env);
    const appUrl = env.APP_URL || env.PUBLIC_SITE_URL || 'https://sealify.pages.dev';

    // Build the base URL for the shared content
    let baseUrl = '';
    if (contentType === 'ad') baseUrl = `${appUrl}/ad/${contentId}`;
    else if (contentType === 'profile') baseUrl = `${appUrl}/profile/${contentId}`;
    else if (contentType === 'store') baseUrl = `${appUrl}/store/${contentId}`;
    else baseUrl = `${appUrl}/ad/${contentId}`;

    // Build full URL with UTM and referral params
    let finalUrl = baseUrl;
    const params = new URLSearchParams({
      utm_source: 'sealify',
      utm_medium: 'social',
      utm_campaign: 'organic_share',
      utm_content: `${contentType}_${contentId}`,
    });

    if (referralCode) {
      params.append('ref', referralCode);
    }

    finalUrl = `${finalUrl}?${params.toString()}`;

    const { data: link } = await sql`
      INSERT INTO public.shareable_links
        (user_id, content_type, content_id, platform, url, utm_source, utm_medium,
         utm_campaign, utm_content, referrer_code, created_at, expires_at)
      VALUES (${authUser.id}, ${contentType}, ${contentId}, ${platform}, ${finalUrl},
              'sealify', 'social', 'organic_share', ${contentType}_${contentId},
              ${referralCode || null}, NOW(), ${expiresAt || null})
      RETURNING *
    `;

    await sql`
      UPDATE public.ads SET views_count = views_count + 1 WHERE id::uuid = ${contentId}
      ON CONFLICT DO NOTHING
    `;

    await auditLog(sql, authUser.id, "Share Link Created", `Created share link for ${contentType} ${contentId}`, "user");

    return c.json({ link: link[0], url: link[0].url });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Create share link error:", error);
    throw new HTTPException(500, { message: "Failed to create share link" });
  }
});

// GET /ad-cards - list user's ad card assets
authRoutes.get("/ad-cards", rateLimit({ windowMs: 600000, maxRequests: 10 }), async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !authUser) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    const sql = getSql(c.env);

    const { data: assets } = await sql`
      SELECT ac.*, a.title, a.price, a.status
      FROM public.ad_card_assets ac
      LEFT JOIN public.ads a ON a.id = ac.ad_id
      WHERE ac.user_id = ${authUser.id}
      ORDER BY ac.created_at DESC
      LIMIT 100
    `;

    return c.json({ cards: assets || [] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Get ad cards error:", error);
    throw new HTTPException(500, { message: "Failed to fetch ad cards" });
  }
});

// POST /ad-cards - generate a new ad card (WhatsApp Status 9:16 optimized)
authRoutes.post("/ad-cards", rateLimit({ windowMs: 600000, maxRequests: 10 }), async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !authUser) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    const body = await c.req.json();
    const { adId, assetType, aspectRatio, width, height, templateId, background, overlays } = body as any;

    if (!adId) throw new HTTPException(400, { message: "ad_id is required" });

    const sql = getSql(c.env);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);
    const appUrl = env.APP_URL || env.PUBLIC_SITE_URL || 'https://sealify.pages.dev';

    // Fetch ad details
    const { data: ad } = await sql`
      SELECT * FROM public.ads WHERE id = ${adId}
    `;

    if (!ad) throw new HTTPException(404, { message: "Ad not found" });

    // Fetch seller profile
    const { data: profile } = await sql`
      SELECT * FROM public.profiles WHERE id = ${ad.seller_id}
    `;

    // Generate title overlay (truncate long titles)
    const title = (overlays?.title || ad.title || 'N/A').substring(0, 40);

    // Generate description overlay
    const description = (ad.description || '').substring(0, 80);

    // Generate price overlay
    const price = ad.price ? `₦${ad.price.toLocaleString('en-NG')}` : '₦N/A';

    // Set defaults based on asset type
    const defaults = {
      'whatsapp_status': { aspectRatio: '9:16', width: 1080, height: 1920 },
      'instagram_post': { aspectRatio: '1:1', width: 1080, height: 1080 },
      'facebook_ad': { aspectRatio: '16:9', width: 1920, height: 1080 },
      'email_banner': { aspectRatio: '16:9', width: 800, height: 450 },
    };

    const config = { ...defaults[assetType || 'whatsapp_status'], ...body };

    const fileName = `ad_card_${adId}_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;

    const { data: card } = await sql`
      INSERT INTO public.ad_card_assets
        (user_id, ad_id, asset_type, aspect_ratio, width, height, file_url,
         thumbnail_url, file_type, title_overlay, description_overlay, price_overlay,
         background_color, font_family, usage_count, created_at)
      VALUES (${authUser.id}, ${adId}, ${assetType || 'whatsapp_status'}, ${config.aspectRatio},
              ${config.width}, ${config.height},
              ${`${appUrl}/api/assets/ad_card/${fileName}`},
              ${`${appUrl}/api/assets/ad_card/${fileName}`}, 'png',
              ${title}, ${description}, ${price},
              ${background || '#ffffff'}, ${'Inter, sans-serif'},
              0, NOW())
      RETURNING *
    `;

    await auditLog(sql, authUser.id, "Ad Card Generated", `Generated ${assetType} for ad ${adId}`, "user");

    return c.json({
      card: card[0],
      url: `${appUrl}/api/assets/ad_card/${fileName}`,
      message: "Ad card generated successfully",
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Generate ad card error:", error);
    throw new HTTPException(500, { message: "Failed to generate ad card" });
  }
});

// GET /status-templates - list available status templates
authRoutes.get("/status-templates", async (c) => {
  try {
    const sql = getSql(c.env);

    const { data: templates } = await sql`
      SELECT * FROM public.status_templates
      WHERE is_active = true
      ORDER BY is_featured DESC, usage_count DESC
    `;

    return c.json({ templates: templates || [] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Get status templates error:", error);
    throw new HTTPException(500, { message: "Failed to fetch status templates" });
  }
});

// POST /qr-codes - generate a new QR code
authRoutes.post("/qr-codes", rateLimit({ windowMs: 600000, maxRequests: 10 }), async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !authUser) {
      throw new HTTPException(401, { message: "Invalid token" });
    }

    const body = await c.req.json();
    const { contentType, contentId, size, isDynamic } = body as any;

    if (!contentType || !contentId) {
      throw new HTTPException(400, { message: "content_type and content_id are required" });
    }

    const sql = getSql(c.env);
    const appUrl = env.APP_URL || env.PUBLIC_SITE_URL || 'https://sealify.pages.dev';

    const url = `${appUrl}/qr/${contentType}/${contentId}`;
    const qrData = JSON.stringify({ type: contentType, id: contentId, source: appUrl });
    const fileName = `qr_${contentType}_${contentId}_${Date.now()}.png`;

    const { data: qr } = await sql`
      INSERT INTO public.qr_codes
        (user_id, content_type, content_id, qr_data, image_url, size_pixels,
         error_correction_level, format, is_dynamic, created_at, expires_at)
      VALUES (${authUser.id}, ${contentType}, ${contentId}, ${qrData},
              ${`${appUrl}/api/assets/qr/${fileName}`},
              ${size || 300}, 'M', 'png', ${isDynamic || false}, NOW(), ${null})
      RETURNING *
    `;

    await auditLog(sql, authUser.id, "QR Code Generated", `Generated QR for ${contentType} ${contentId}`, "user");

    return c.json({
      qr: qr[0],
      url: `${appUrl}/qr/${contentType}/${contentId}`,
      image: `${appUrl}/api/assets/qr/${fileName}`,
      message: "QR code generated successfully",
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Generate QR code error:", error);
    throw new HTTPException(500, { message: "Failed to generate QR code" });
  }
});

// ===========================================================
// PILLAR 6: Social Share Event Tracking
// ===========================================================

// Track social share/click/conversion events
authRoutes.post("/social-share-events", rateLimit({ windowMs: 60000, maxRequests: 50 }), async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    const body = await c.req.json();

    let userId = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) userId = user.id;
    }

    const sql = getSql(c.env);

    const { data: event } = await sql`
      INSERT INTO public.social_share_events
        (user_id, shareable_link_id, platform, event_type, shared_by_user_agent,
         referrer, shared_at)
      VALUES (${userId || null}, ${body.shareableLinkId || null}, ${body.platform || 'direct'},
              ${body.eventType || 'share'}, ${body.userAgent || null},
              ${body.referrer || null}, NOW())
      ON CONFLICT DO NOTHING
      RETURNING *
    `;

    // Update shareable link counters
    if (body.shareableLinkId && body.eventType === 'click') {
      await sql`
        UPDATE public.shareable_links
        SET clicks = clicks + 1, last_used_at = NOW()
        WHERE id = ${body.shareableLinkId}
      `;
    }

    if (body.shareableLinkId && body.eventType === 'conversion') {
      await sql`
        UPDATE public.shareable_links
        SET conversions = conversions + 1
        WHERE id = ${body.shareableLinkId}
      `;
    }

    return c.json({ success: true });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Social share events error:", error);
    throw new HTTPException(500, { message: "Failed to record share event" });
  }
});

export default authRoutes;
