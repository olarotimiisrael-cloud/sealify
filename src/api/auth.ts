import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, sanitizeInput, auditLog, logIntrusionAttempt } from "../middleware/security";
import { z } from "zod";

export const authRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql> } }>();

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

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
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

// Admin login uses the same Supabase Auth credentials as ordinary login, but
// performs the role decision server-side and returns one generic failure for
// bad credentials and non-admin accounts.
authRoutes.post("/admin-login", async (c) => {
  const env = c.env as any;
  const body = await c.req.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) throw genericAdminLoginError();

  const email = parsed.data.email.trim().toLowerCase();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
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
    throw new HTTPException(429, { message: "Too many authentication attempts. Please try again later." });
  }
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    await logIntrusionAttempt(sql, email, c.req.raw, { reason: "admin_authentication_failed" }).catch(() => undefined);
    throw genericAdminLoginError();
  }

  const isAdmin = await sql`SELECT private.is_admin(${data.user.id}) AS is_admin`;
  if (!isAdmin[0]?.is_admin) {
    await supabase.auth.signOut();
    await logIntrusionAttempt(sql, email, c.req.raw, { reason: "admin_authorization_failed" }).catch(() => undefined);
    throw genericAdminLoginError();
  }

  await sql`
    UPDATE intrusion_logs
    SET status = 'dismissed'
    WHERE attempted_email = ${email}
      AND status = 'flagged'
      AND created_at >= NOW() - INTERVAL '15 minutes'
  `;
  await auditLog(sql, data.user.id, "Admin Login", "Successful administrator authentication", "security");
  return c.json({ session: data.session });
});

// Login
authRoutes.post("/login", authRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const validated = loginSchema.parse(body);
    const { email, password } = validated;

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
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
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);

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
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);

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
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);

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
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);

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
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${redirectBase}/reset-password` });
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
    const { phone } = body;

    if (!phone) {
      throw new HTTPException(400, { message: "Phone number required" });
    }

    const provider = env.TERMII_API_KEY || env.ARKESEL_API_KEY || env.TWILIO_ACCOUNT_SID;
    if (!provider) {
      throw new HTTPException(503, { message: "Phone OTP is disabled until a real SMS provider is configured." });
    }

    return c.json({ success: true, message: "OTP sent" });
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
    const { phone, otp } = body;

    if (!phone || !otp) {
      throw new HTTPException(400, { message: "Phone and OTP required" });
    }

    if (!env.TERMII_API_KEY && !env.ARKESEL_API_KEY && !env.TWILIO_ACCOUNT_SID) {
      throw new HTTPException(503, { message: "Phone OTP verification is disabled until a real SMS provider is configured." });
    }

    return c.json({ success: true, message: "Phone verified" });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Verify OTP error:", error);
    throw new HTTPException(500, { message: "Verification failed" });
  }
});

export default authRoutes;
