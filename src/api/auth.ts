import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, sanitizeInput, auditLog, logIntrusionAttempt, checkIsAdmin } from "../middleware/security";
import { z } from "zod";

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
});

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 }); // 10 req/15min

// This is deliberately keyed by normalized email, not browser state or IP.
// Supabase Auth remains the credential authority; intrusion_logs makes the
// temporary throttle durable across browser refreshes and Worker instances.
const ADMIN_LOGIN_COOLDOWN_MS = 5 * 60 * 1000;
const ADMIN_LOGIN_MAX_FAILURES = 5;

const genericAdminLoginError = () => new HTTPException(401, { message: "Unable to authenticate administrator" });

// Register
authRoutes.post("/register", authRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();

    // Validate input
    const validated = registerSchema.parse(body);
    const { email, password, fullName, phoneNumber } = validated;

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

    return c.json({
      user: {
        id: userId,
        email,
        fullName: sanitizeInput(fullName),
        phoneNumber,
        role: "buyer",
        verified: false,
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

    await sql`
      UPDATE profiles SET ${sql(updates)} WHERE id = ${user.id}
    `;

    await auditLog(getSql(c.env), user.id, "Profile Completed", "OAuth user completed profile", "user");

    const updated = await sql`SELECT * FROM profiles WHERE id = ${user.id}`;
    return c.json({ user: updated[0] });
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

  // Validate service role key prefix: Supabase service role keys must start
  // with "sb_service_role_". A key with the wrong prefix (e.g. "sb_secret_")
  // silently authenticates as an unprivileged role, causing signInWithPassword
  // to fail in ways that surface as HTML error pages from PostgREST.
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && !serviceKey.startsWith("sb_service_role_")) {
    console.error(`[ADMIN LOGIN] SUPABASE_SERVICE_ROLE_KEY has invalid prefix; expected "sb_service_role_" but got "${serviceKey.slice(0, 16)}..."`);
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

    await sql`
      UPDATE profiles SET ${sql(updates)} WHERE id = ${user.id}
    `;

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

    await supabase.auth.signOut();

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
      const redirectBase = env.APP_URL || env.PUBLIC_SITE_URL || "https://sealify.ng";
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

export default authRoutes;
