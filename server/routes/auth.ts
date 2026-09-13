import { Router } from 'express';
import { z } from 'zod';
import { getSupabase } from '../db/supabase.js';
import { getSql } from '../db/postgres.js';
import { AppError } from '../middleware/error-handler.js';
import { isAdmin, logIntrusionAttempt, clearIntrusionLogs, auditLog } from '../services/admin-service.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password required'),
  accessKey: z.string().min(1, 'Access key required').optional(),
});

const ADMIN_LOGIN_COOLDOWN_MS = 5 * 60 * 1000;
const ADMIN_LOGIN_MAX_FAILURES = 5;

const genericAdminLoginError = () => new AppError('Unable to authenticate administrator', 401);

const getConfiguredAdminCredentials = () => ({
  email: (process.env.VITE_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@sealify.ng').trim().toLowerCase(),
  password: (process.env.VITE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'sealify2027').trim(),
  accessKey: (process.env.VITE_ADMIN_ACCESS_KEY || process.env.ADMIN_ACCESS_KEY || '336699').trim(),
});

const allowLocalDevAdminOverride = (email: string, password: string, accessKey: string): boolean => {
  if (process.env.NODE_ENV === 'production') return false;
  const configured = getConfiguredAdminCredentials();
  return (
    email.trim().toLowerCase() === configured.email &&
    password.trim() === configured.password &&
    accessKey.trim() === configured.accessKey
  );
};

authRouter.post('/admin-login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw genericAdminLoginError();

    const email = parsed.data.email.trim().toLowerCase();
    const accessKey = (parsed.data.accessKey || '').trim();
    const requiredAccessKey = (process.env.ADMIN_ACCESS_KEY || process.env.VITE_ADMIN_ACCESS_KEY || '336699').trim();

    if (!accessKey || accessKey !== requiredAccessKey) {
      throw genericAdminLoginError();
    }

    if (allowLocalDevAdminOverride(email, parsed.data.password, accessKey)) {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: parsed.data.password,
      });

      if (error || !data.session || !data.user) {
        throw genericAdminLoginError();
      }

      return res.json({ session: data.session });
    }

    const supabase = getSupabase();

    // Step 1: Authenticate with Supabase FIRST (no database dependency)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    // Step 2: If authentication fails, attempt to record intrusion (if DB available)
    if (error || !data.user) {
      await logIntrusionAttempt(
        email,
        'admin_authentication_failed',
        req.ip,
        req.headers['user-agent']
      );
      throw genericAdminLoginError();
    }

    // Step 3: Authentication succeeded - now obtain database connection
    let sql;
    try {
      sql = getSql();
    } catch {
      // Database not available - cannot verify admin role, deny access
      await supabase.auth.signOut();
      throw genericAdminLoginError();
    }

    // Step 4: Check rate limiting
    try {
      const recentFailures = await sql`
        SELECT COUNT(*)::int AS count, MAX(created_at) AS latest
        FROM intrusion_logs
        WHERE attempted_email = ${email}
          AND status = 'flagged'
          AND created_at >= NOW() - INTERVAL '15 minutes'
      `;
      const latestFailure = recentFailures[0]?.latest
        ? new Date(recentFailures[0].latest).getTime()
        : 0;
      if (
        Number(recentFailures[0]?.count || 0) >= ADMIN_LOGIN_MAX_FAILURES &&
        Date.now() - latestFailure < ADMIN_LOGIN_COOLDOWN_MS
      ) {
        throw new AppError('Too many authentication attempts. Please try again later.', 429);
      }
    } catch (rateLimitError) {
      if (rateLimitError instanceof AppError) throw rateLimitError;
      // Rate limit check failed - continue (admin check is mandatory)
    }

    // Step 5: Verify admin role (MANDATORY)
    const adminStatus = await isAdmin(data.user.id);
    if (!adminStatus) {
      await supabase.auth.signOut();
      await logIntrusionAttempt(
        email,
        'admin_authorization_failed',
        req.ip,
        req.headers['user-agent']
      );
      throw genericAdminLoginError();
    }

    // Step 6: Success - clear intrusion logs and record audit
    await clearIntrusionLogs(email);
    await auditLog(data.user.id, 'Admin Login', 'Successful administrator authentication', 'security');

    res.json({ session: data.session });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError('Invalid email or password', 400);

    const { email, password } = parsed.data;
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      throw new AppError('Invalid email or password', 401);
    }

    let profile = null;
    try {
      const sql = getSql();
      const result = await sql`SELECT * FROM profiles WHERE id = ${data.user.id}`;
      profile = result[0] || null;
    } catch {
      // Database unavailable - return basic user info
    }

    res.json({
      user: profile || {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name,
        role: 'buyer',
      },
      session: data.session,
    });
  } catch (err) {
    next(err);
  }
});
