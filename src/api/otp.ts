import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../db/hyperdrive';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, auditLog, rateLimit } from '../middleware/security';
import { z } from 'zod';
import { generateOtp, hashOtp, sendEmailViaSelfHosted, sendSmsViaSelfHosted, type Env } from '../lib/selfHostedProviders';

export const otpRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql> } }>();

const otpRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 });
const verifyRateLimit = rateLimit({ windowMs: 5 * 60 * 1000, maxRequests: 10 });

const requestSchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  channel: z.enum(['email', 'phone']).optional().default('email'),
});

const verifySchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  otp: z.string().regex(/^\d{6}$/, 'Invalid OTP code'),
  otpId: z.string().optional(),
});

const resendSchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  channel: z.enum(['email', 'phone']).optional().default('email'),
});

function getEnv(env: Env): any {
  return env as any;
}

function normalizeIdentifier(identifier: string, channel: 'email' | 'phone'): string {
  if (channel === 'email') {
    return identifier.trim().toLowerCase();
  }
  return identifier.replace(/\D/g, '');
}

function getOtpExpiryMs(env: Env): number {
  return parseInt(env.OTP_EXPIRY_MS || '600000') || 600000;
}

function getOtpLength(env: Env): number {
  return parseInt(env.OTP_LENGTH || '6') || 6;
}

async function findUserByChannel(env: Env, channel: 'email' | 'phone', identifier: string) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);
  const cleaned = normalizeIdentifier(identifier, channel);
  const column = channel === 'email' ? 'email' : 'phone_number';

  const { data, error } = await supabase.from('profiles').select('id, full_name, email, phone_number').eq(column, cleaned).maybeSingle();
  if (error) {
    throw new HTTPException(500, { message: 'Failed to look up user' });
  }
  return data;
}

async function insertOtp(env: Env, channel: 'email' | 'phone', identifier: string, otpHash: string, expiresAt: Date) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);
  const normalized = normalizeIdentifier(identifier, channel);

  if (channel === 'email') {
    await supabase.from('email_otps').delete().eq('email', normalized).gt('created_at', new Date(Date.now() - 60 * 60 * 1000));
    const { data, error } = await supabase.from('email_otps').insert({
      email: normalized,
      otp_hash: otpHash,
      expires_at: expiresAt.toISOString(),
      sent_to_email: normalized,
      delivered_via: 'smtp',
      attempts: 0,
    }).select('id').single();
    if (error) throw new HTTPException(500, { message: 'Failed to create OTP' });
    return data;
  }

  await supabase.from('phone_otps').delete().eq('phone_number', normalized).gt('created_at', new Date(Date.now() - 60 * 60 * 1000));
  const { data, error } = await supabase.from('phone_otps').insert({
    phone_number: normalized,
    otp_hash: otpHash,
    expires_at: expiresAt.toISOString(),
    delivered_via: 'sms',
    attempts: 0,
  }).select('id').single();
  if (error) throw new HTTPException(500, { message: 'Failed to create OTP' });
  return data;
}

async function verifyOtp(env: Env, channel: 'email' | 'phone', identifier: string, otp: string, otpId?: string) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);
  const normalized = normalizeIdentifier(identifier, channel);
  const inputHash = await hashOtp(otp);

  let otpRecord: any = null;
  if (channel === 'email') {
    const { data, error } = await supabase.from('email_otps')
      .select('*')
      .eq('email', normalized)
      .eq('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) throw new HTTPException(400, { message: 'No OTP found for this email' });
    otpRecord = data;
  } else {
    const { data, error } = await supabase.from('phone_otps')
      .select('*')
      .eq('phone_number', normalized)
      .eq('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) throw new HTTPException(400, { message: 'No OTP found for this phone number' });
    otpRecord = data;
  }

  if (otpId && otpRecord.id !== otpId) {
    throw new HTTPException(400, { message: 'OTP does not match the requested code' });
  }

  const now = new Date();
  if (now > new Date(otpRecord.expires_at)) {
    throw new HTTPException(400, { message: 'OTP has expired' });
  }

  if (otpRecord.otp_hash !== inputHash) {
    const attempts = (otpRecord.attempts || 0) + 1;
    await supabase.from(channel === 'email' ? 'email_otps' : 'phone_otps')
      .update({ attempts })
      .eq('id', otpRecord.id);
    if (attempts >= 5) {
      throw new HTTPException(400, { message: 'Too many failed attempts. Please request a new OTP.' });
    }
    throw new HTTPException(400, { message: 'Invalid OTP code' });
  }

  await supabase.from(channel === 'email' ? 'email_otps' : 'phone_otps')
    .update({ used_at: now.toISOString() })
    .eq('id', otpRecord.id);

  const user = await findUserByChannel(env, channel, normalized);
  if (user) {
    await supabase.from('profiles').update({
      verified: true,
      email_confirmed_at: channel === 'email' ? now.toISOString() : supabase.from('profiles').select('email_confirmed_at').eq('id', user.id).maybeSingle().then((r) => r.data?.email_confirmed_at || null),
      phone_verified_at: channel === 'phone' ? now.toISOString() : supabase.from('profiles').select('phone_verified_at').eq('id', user.id).maybeSingle().then((r) => r.data?.phone_verified_at || null),
    }).eq('id', user.id);
  }

  return { success: true, message: channel === 'email' ? 'Email verified' : 'Phone verified', userId: user?.id || null };
}

otpRoutes.post('/request', otpRateLimit, async (c) => {
  try {
    const env = getEnv(c.env);
    const body = await c.req.json();
    const validated = requestSchema.parse(body);
    const { identifier, channel } = validated;
    const sql = getSql(c.env);
    const user = await findUserByChannel(env, channel, identifier);
    if (!user) {
      throw new HTTPException(404, { message: 'No account found for this identifier' });
    }

    const otp = await generateOtp(getOtpLength(env));
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + getOtpExpiryMs(env));
    const otpRecord = await insertOtp(env, channel, identifier, otpHash, expiresAt);

    let delivery: any = { success: false, error: 'Delivery failed' };
    if (channel === 'email') {
      const origin = c.req.header('origin') || env.PUBLIC_SITE_URL || env.APP_URL || 'http://localhost:5173';
      const emailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 20px; color: #1e293b;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
              <h2 style="color: #059669;">Sealify Email Verification</h2>
              <p>Hello ${user.full_name || 'Sealify User'},</p>
              <p>Your one-time password (OTP) to verify your Sealify account is:</p>
              <div style="text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #059669; padding: 20px; background: #ecfdf5; border-radius: 8px;">${otp}</div>
              <p>This code expires in 10 minutes. If you did not request this code, please ignore this email.</p>
              <p style="color: #64748b; font-size: 13px;">Secure link: ${origin}/verify</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="color: #64748b; font-size: 12px;">Sealify Security Team</p>
            </div>
          </body>
        </html>`;
      delivery = await sendEmailViaSelfHosted(env, {
        to: user.email,
        from: env.EMAIL_FROM || env.ADMIN_EMAIL_FROM || 'admin@sealify.ng',
        subject: 'Sealify Email Verification OTP',
        html: emailHtml,
        text: `Your Sealify email verification OTP is: ${otp}`,
        headers: { 'X-OTP-Channel': 'email', 'X-OTP-Id': otpRecord.id },
      });
    } else {
      delivery = await sendSmsViaSelfHosted(env, {
        to: user.phone_number || identifier,
        message: `Sealify OTP: ${otp}. Valid for 10 minutes. Do not share this code.`,
      });
    }

    await auditLog(sql, user.id, 'OTP Requested', `Channel: ${channel}, identifier: ${identifier}, delivered: ${delivery.success}`, 'verification');
    return c.json({ success: true, otpId: otpRecord.id, channel, message: delivery.success ? 'OTP sent successfully' : 'OTP generated, delivery pending' });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) throw new HTTPException(400, { message: 'Validation failed', cause: error.errors });
    console.error('OTP request error:', error);
    throw new HTTPException(500, { message: 'Failed to request OTP' });
  }
});

otpRoutes.post('/verify', verifyRateLimit, async (c) => {
  try {
    const env = getEnv(c.env);
    const body = await c.req.json();
    const validated = verifySchema.parse(body);
    const result = await verifyOtp(env, validated.channel || 'email', validated.identifier, validated.otp, validated.otpId);
    const sql = getSql(c.env);
    await auditLog(sql, result.userId || 'unknown', 'OTP Verified', `Channel: ${validated.channel || 'email'}`, 'verification');
    return c.json(result);
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) throw new HTTPException(400, { message: 'Validation failed', cause: error.errors });
    console.error('OTP verify error:', error);
    throw new HTTPException(500, { message: 'Failed to verify OTP' });
  }
});

otpRoutes.post('/resend', otpRateLimit, async (c) => {
  try {
    const env = getEnv(c.env);
    const body = await c.req.json();
    const validated = resendSchema.parse(body);
    const user = await findUserByChannel(env, validated.channel, validated.identifier);
    if (!user) throw new HTTPException(404, { message: 'No account found for this identifier' });
    const otp = await generateOtp(getOtpLength(env));
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + getOtpExpiryMs(env));
    const otpRecord = await insertOtp(env, validated.channel, validated.identifier, otpHash, expiresAt);
    let delivery: any = { success: false, error: 'Delivery failed' };
    if (validated.channel === 'email') {
      delivery = await sendEmailViaSelfHosted(env, {
        to: user.email,
        from: env.EMAIL_FROM || env.ADMIN_EMAIL_FROM || 'admin@sealify.ng',
        subject: 'Sealify Email Verification OTP Resend',
        html: `<html><body><h2>Sealify Email Verification</h2><p>Your OTP is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p></body></html>`,
        text: `Your Sealify email verification OTP is: ${otp}`,
        headers: { 'X-OTP-Channel': 'email', 'X-OTP-Id': otpRecord.id },
      });
    } else {
      delivery = await sendSmsViaSelfHosted(env, {
        to: user.phone_number || validated.identifier,
        message: `Sealify OTP: ${otp}. Valid for 10 minutes. Do not share this code.`,
      });
    }
    await auditLog(getSql(c.env), user.id, 'OTP Resent', `Channel: ${validated.channel}`, 'verification');
    return c.json({ success: true, otpId: otpRecord.id, channel: validated.channel, message: delivery.success ? 'OTP resent successfully' : 'OTP generated, delivery pending' });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) throw new HTTPException(400, { message: 'Validation failed', cause: error.errors });
    console.error('OTP resend error:', error);
    throw new HTTPException(500, { message: 'Failed to resend OTP' });
  }
});

export default otpRoutes;
