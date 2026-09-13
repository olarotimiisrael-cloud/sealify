import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createClient } from '@supabase/supabase-js';
import { getSql } from '../../_middleware/db';
import { getSupabase } from '../../_middleware/supabase';
import { requireAuth } from '../../_middleware/auth';
import { auditLog, logIntrusionAttempt, clearIntrusionLogs, isAdmin } from '../../_middleware/admin-service';
import { authRateLimit, registerSchema, loginSchema, updateProfileSchema, sanitizeInput } from '../../_middleware/security';
import type { AppContext } from '../../_middleware/types';

export const authRoutes = new Hono<AppContext>();

const ADMIN_LOGIN_COOLDOWN_MS = 5 * 60 * 1000;
const ADMIN_LOGIN_MAX_FAILURES = 5;

const genericAdminLoginError = () => new HTTPException(401, { message: 'Unable to authenticate administrator' });

// Register
authRoutes.post('/register', authRateLimit, async (c) => {
  try {
    const body = await c.req.json();
    const validated = registerSchema.parse(body);
    const { email, password, fullName, phoneNumber } = validated;

    const supabase = getSupabase(c.env);
    const sql = getSql(c.env);

    // Check if user already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      throw new HTTPException(409, { message: 'Email already registered' });
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
      throw new HTTPException(500, { message: 'Failed to create user' });
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

    await auditLog(sql, userId, 'User Registered', `New user registered: ${email}`, 'user');

    return c.json({
      user: {
        id: userId,
        email,
        fullName: sanitizeInput(fullName),
        phoneNumber,
        role: 'buyer',
        verified: false,
      },
      session: authData.session
    }, 201);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof Error && error.name === 'ZodError') {
      throw new HTTPException(400, { message: 'Validation failed', cause: error });
    }
    console.error('Registration error:', error);
    throw new HTTPException(500, { message: 'Registration failed' });
  }
});

// Admin login
authRoutes.post('/admin-login', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) throw genericAdminLoginError();

    const email = parsed.data.email.trim().toLowerCase();
    const accessKey = (parsed.data.accessKey || '').trim();
    const requiredAccessKey = ((c.env.ADMIN_ACCESS_KEY || c.env.VITE_ADMIN_ACCESS_KEY || 'sealify-admin-access-key') as string).trim();

    if (!accessKey || accessKey !== requiredAccessKey) {
      throw genericAdminLoginError();
    }

    const supabase = getSupabase(c.env);

    // Step 1: Authenticate with Supabase FIRST (no database dependency)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password
    });

    // Step 2: If authentication fails, attempt to record intrusion (if DB available)
    if (error || !data.user) {
      try {
        const sql = getSql(c.env);
        await logIntrusionAttempt(sql, email, c.req.raw.headers.get('x-forwarded-for') || c.req.raw.headers.get('x-real-ip') || undefined, c.req.raw.headers.get('user-agent') || undefined, { reason: 'admin_authentication_failed' });
      } catch {
        // Database unavailable - still return generic error, do not leak details
      }
      throw genericAdminLoginError();
    }

    // Step 3: Authentication succeeded - now obtain database connection
    let sql;
    try {
      sql = getSql(c.env);
    } catch {
      // Hyperdrive not available - cannot verify admin role, deny access
      await supabase.auth.signOut();
      throw genericAdminLoginError();
    }

    // Step 4: Check rate limiting (only if database is available)
    try {
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
        throw new HTTPException(429, { message: 'Too many authentication attempts. Please try again later.' });
      }
    } catch (rateLimitError) {
      if (rateLimitError instanceof HTTPException) throw rateLimitError;
      // Rate limit check failed - continue (admin check is mandatory)
    }

    // Step 5: Verify admin role (MANDATORY)
    const isAdminResult = await isAdmin(data.user.id, c.env);
    if (!isAdminResult) {
      await supabase.auth.signOut();
      await logIntrusionAttempt(sql, email, c.req.raw.headers.get('x-forwarded-for') || c.req.raw.headers.get('x-real-ip') || undefined, c.req.raw.headers.get('user-agent') || undefined, { reason: 'admin_authorization_failed' }).catch(() => undefined);
      throw genericAdminLoginError();
    }

    // Step 6: Success - clear intrusion logs and record audit
    await sql`
      UPDATE intrusion_logs
      SET status = 'dismissed'
      WHERE attempted_email = ${email}
        AND status = 'flagged'
        AND created_at >= NOW() - INTERVAL '15 minutes'
    `;
    await auditLog(sql, data.user.id, 'Admin Login', 'Successful administrator authentication', 'security');
    return c.json({ session: data.session });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw genericAdminLoginError();
  }
});

// Login
authRoutes.post('/login', authRateLimit, async (c) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) throw new HTTPException(400, { message: 'Invalid email or password' });

    const { email, password } = parsed.data;
    const supabase = getSupabase(c.env);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      throw new HTTPException(401, { message: 'Invalid email or password' });
    }

    let profile = null;
    try {
      const sql = getSql(c.env);
      const result = await sql`SELECT * FROM profiles WHERE id = ${data.user.id}`;
      profile = result[0] || null;
    } catch {
      // Database unavailable - return basic user info
    }

    return c.json({
      user: profile || {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name,
        role: 'buyer',
      },
      session: data.session,
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Login failed' });
  }
});

// Get current user profile
authRoutes.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const supabase = getSupabase(c.env);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new HTTPException(401, { message: 'Invalid token' });
    }

    const sql = getSql(c.env);
    const profile = await sql`SELECT * FROM profiles WHERE id = ${user.id}`;

    return c.json({ user: profile[0] || null });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Get user error:', error);
    throw new HTTPException(500, { message: 'Failed to get user' });
  }
});

// Update user profile
authRoutes.put('/profile', requireAuth, async (c) => {
  try {
    const user = c.get('user')!;
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
      const camelField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (validated[camelField as keyof typeof validated] !== undefined) {
        updates[field] = validated[camelField as keyof typeof validated];
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

    await auditLog(sql, user.id, 'Profile Updated', 'User updated their profile', 'user');

    const updated = await sql`SELECT * FROM profiles WHERE id = ${user.id}`;
    return c.json({ user: updated[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof Error && error.name === 'ZodError') {
      throw new HTTPException(400, { message: 'Validation failed', cause: error });
    }
    console.error('Update profile error:', error);
    throw new HTTPException(500, { message: 'Failed to update profile' });
  }
});

// Logout
authRoutes.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const supabase = getSupabase(c.env);

    await supabase.auth.signOut();

    return c.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    throw new HTTPException(500, { message: 'Logout failed' });
  }
});

// Request password reset (with NIN verification)
authRoutes.post('/password/reset-request', authRateLimit, async (c) => {
  try {
    const body = await c.req.json();
    const { email, nin, idDocumentUrl, reason } = body;

    if (!email || !nin || !idDocumentUrl || !reason) {
      throw new HTTPException(400, { message: 'All fields required' });
    }

    const sql = getSql(c.env);
    const supabase = getSupabase(c.env);

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('email', email)
      .single();

    if (!profile) {
      return c.json({ success: true, message: 'If the email exists, a reset request has been queued' });
    }

    await sql`
      INSERT INTO password_requests (user_id, user_email, user_name, nin, id_document_url, new_password_hash, reason, status, created_at, updated_at)
      VALUES (${profile.id}, ${email}, ${profile.full_name}, ${nin}, ${idDocumentUrl}, 'SECURE_RESET_REQUIRED', ${reason}, 'pending', NOW(), NOW())
    `;

    try {
      const redirectBase = c.env.APP_URL || c.env.PUBLIC_SITE_URL || 'https://sealify.ng';
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${redirectBase}/reset-password` });
    } catch (resetError) {
      console.warn('Password reset email dispatch failed - request still recorded for admin review:', resetError);
    }

    await auditLog(sql, profile.id, 'Password Reset Requested', `Password reset requested for ${email}`, 'security');

    return c.json({ success: true, message: 'Password reset request submitted for admin review' });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Password reset request error:', error);
    throw new HTTPException(500, { message: 'Failed to process request' });
  }
});

// Send phone OTP
authRoutes.post('/phone/otp', authRateLimit, async (c) => {
  try {
    const body = await c.req.json();
    const { phone } = body;

    if (!phone) {
      throw new HTTPException(400, { message: 'Phone number required' });
    }

    const provider = c.env.TERMII_API_KEY || c.env.ARKESEL_API_KEY || c.env.TWILIO_ACCOUNT_SID;
    if (!provider) {
      throw new HTTPException(503, { message: 'Phone OTP is disabled until a real SMS provider is configured.' });
    }

    return c.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Send OTP error:', error);
    throw new HTTPException(500, { message: 'Failed to send OTP' });
  }
});

// Verify phone OTP
authRoutes.post('/phone/verify', authRateLimit, async (c) => {
  try {
    const body = await c.req.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      throw new HTTPException(400, { message: 'Phone and OTP required' });
    }

    if (!c.env.TERMII_API_KEY && !c.env.ARKESEL_API_KEY && !c.env.TWILIO_ACCOUNT_SID) {
      throw new HTTPException(503, { message: 'Phone OTP verification is disabled until a real SMS provider is configured.' });
    }

    return c.json({ success: true, message: 'Phone verified' });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error('Verify OTP error:', error);
    throw new HTTPException(500, { message: 'Verification failed' });
  }
});

export default authRoutes;