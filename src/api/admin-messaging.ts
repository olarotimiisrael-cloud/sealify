import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSql } from '../db/hyperdrive';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, auditLog, rateLimit } from '../middleware/security';
import { z } from 'zod';
import { generateOtp, hashOtp, sendEmailViaSelfHosted, sendSmsViaSelfHosted, type Env } from '../lib/selfHostedProviders';

export const messagingRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql>; user: any } }>();

const sendMessageSchema = z.object({
  target: z.enum(['all', 'buyer', 'seller', 'individual']),
  title: z.string().max(200),
  content: z.string().max(1_000_000),
  content_type: z.enum(['text', 'markdown', 'html']).optional().default('text'),
  channel: z.enum(['in_app', 'email', 'sms', 'whatsapp']).optional().default('in_app'),
  userIds: z.array(z.string().uuid()).optional(),
  sendEmail: z.boolean().optional().default(false),
  sendSms: z.boolean().optional().default(false),
});

const broadcastSchema = z.object({
  target: z.enum(['all', 'buyer', 'seller']),
  title: z.string().max(200),
  content: z.string().max(1_000_000),
  content_type: z.enum(['text', 'markdown', 'html']).optional().default('text'),
  channel: z.enum(['in_app', 'email', 'sms', 'whatsapp']).optional().default('in_app'),
  audience: z.enum(['buyer', 'seller']).optional(),
  sendEmail: z.boolean().optional().default(false),
  sendSms: z.boolean().optional().default(false),
});

const getEnv = (env: any) => env as Env;

function getOtpExpiryMs(env: Env): number {
  return parseInt(env.OTP_EXPIRY_MS || '600000') || 600000;
}

function getOtpLength(env: Env): number {
  return parseInt(env.OTP_LENGTH || '6') || 6;
}

function getConcurrency(env: Env): number {
  return parseInt(env.BROADCAST_CONCURRENCY || '10') || 10;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

async function fetchUsers(sql: any, env: any, target: string, audience?: string) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  if (target === 'all') {
    const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number, role');
    return data || [];
  }

  if (target === 'individual') {
    const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number, role').in('id', []);
    return data || [];
  }

  if (target === 'buyer' || audience === 'buyer') {
    const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number, role').eq('role', 'buyer');
    return data || [];
  }

  if (target === 'seller' || audience === 'seller') {
    const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number, role').eq('role', 'seller');
    return data || [];
  }

  return [];
}

messagingRoutes.use('/*', rateLimit({ windowMs: 60 * 1000, maxRequests: 20 }));

messagingRoutes.post('/send', requireAdmin, async (c) => {
  try {
    const env = getEnv(c.env);
    const sql = getSql(c.env);
    const body = await c.req.json();
    const validated = sendMessageSchema.parse(body);
    const sender = c.get('user');

    if (!validated.userIds?.length && validated.target === 'individual') {
      throw new HTTPException(400, { message: 'userIds required for individual target' });
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    let userList: any[] = [];
    let description = '';

    if (validated.target === 'all') {
      const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number, role');
      userList = data || [];
      description = `All users (${userList.length})`;
    } else if (validated.target === 'individual' && validated.userIds?.length) {
      const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number, role').in('id', validated.userIds);
      userList = data || [];
      description = `Selected users (${userList.length})`;
    } else if (validated.target === 'buyer') {
      const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number, role').eq('role', 'buyer');
      userList = data || [];
      description = `Buyers (${userList.length})`;
    } else if (validated.target === 'seller') {
      const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number, role').eq('role', 'seller');
      userList = data || [];
      description = `Sellers (${userList.length})`;
    }

    if (userList.length === 0) {
      throw new HTTPException(404, { message: 'No users found for the selected target' });
    }

    let concurrency = getConcurrency(env);
    if (concurrency < 1) concurrency = 1;

    const results: any[] = [];
    const errors: string[] = [];

    const emailPromises: Promise<any>[] = [];
    const smsPromises: Promise<any>[] = [];
    let emailIndex = 0;
    let smsIndex = 0;

    for (const user of userList) {
      const result: any = {
        userId: user.id,
        email: user.email,
        name: user.full_name,
        phone: user.phone_number,
        success: true,
      };

      try {
        const insertResult = await sql`
          INSERT INTO public.admin_messages (sender_id, receiver_id, title, content, content_type, channel, status, created_at, updated_at)
          VALUES (${sender.id}, ${user.id}, ${validated.title}, ${validated.content}, ${validated.content_type}, ${validated.channel}, 'sent', NOW(), NOW())
          RETURNING *
        `;
        result.messageId = insertResult[0]?.id;

        if (validated.sendEmail || validated.channel === 'email') {
          const emailJob = (async () => {
            try {
              const idx = emailIndex++;
              await new Promise((resolve) => setTimeout(resolve, (idx % concurrency) * 100));
              const emailResponse = await sendEmailViaSelfHosted(env, {
                to: user.email,
                from: env.ADMIN_EMAIL_FROM || 'admin@sealify.ng',
                subject: validated.title,
                html: validated.content,
                text: validated.content,
                headers: {
                  'X-Admin-Sent': 'true',
                  'X-Target-User': user.id,
                  'X-Audience': validated.target,
                },
              });
              result.emailSent = emailResponse.success;
              if (!emailResponse.success) result.emailError = emailResponse.error;
            } catch (e: any) {
              result.emailSent = false;
              result.emailError = e.message;
            }
          })();
          emailPromises.push(emailJob);
        }

        if (validated.sendSms || validated.channel === 'sms') {
          const smsJob = (async () => {
            try {
              const idx = smsIndex++;
              await new Promise((resolve) => setTimeout(resolve, (idx % concurrency) * 100));
              if (user.phone_number) {
                const smsResponse = await sendSmsViaSelfHosted(env, {
                  to: user.phone_number,
                  message: `${validated.title}: ${validated.content}`,
                });
                result.smsSent = smsResponse.success;
                if (!smsResponse.success) result.smsError = smsResponse.error;
              } else {
                result.smsSent = false;
                result.smsError = 'No phone number';
              }
            } catch (e: any) {
              result.smsSent = false;
              result.smsError = e.message;
            }
          })();
          smsPromises.push(smsJob);
        }

        results.push(result);
      } catch (insertError: any) {
        result.success = false;
        result.error = insertError.message;
        errors.push(insertError.message);
        results.push(result);
      }
    }

    await Promise.all([...emailPromises, ...smsPromises]);

    const successful = results.filter(r => r.success && (r.emailSent !== false && r.smsSent !== false)).length;
    const failed = results.length - successful;

    await auditLog(sql, sender.id, 'Admin Message Sent', `Target: ${description}, Success: ${successful}, Failed: ${failed}`, 'broadcast');

    return c.json({
      success: true,
      target: description,
      total: userList.length,
      successful,
      failed,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) throw new HTTPException(400, { message: 'Validation failed', cause: error.errors });
    console.error('Admin messaging error:', error);
    throw new HTTPException(500, { message: 'Failed to send message' });
  }
});

messagingRoutes.post('/broadcast', requireAdmin, async (c) => {
  try {
    const env = getEnv(c.env);
    const sql = getSql(c.env);
    const body = await c.req.json();
    const validated = broadcastSchema.parse(body);
    const sender = c.get('user');

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    let userList: any[] = [];
    let description = '';

    if (validated.target === 'all') {
      const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number, role');
      userList = data || [];
      description = `All users (${userList.length})`;
    } else if (validated.target === 'buyer') {
      const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number, role').eq('role', 'buyer');
      userList = data || [];
      description = `Buyers (${userList.length})`;
    } else if (validated.target === 'seller') {
      const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number, role').eq('role', 'seller');
      userList = data || [];
      description = `Sellers (${userList.length})`;
    }

    if (userList.length === 0) {
      throw new HTTPException(404, { message: 'No users found for the selected target' });
    }

    let concurrency = getConcurrency(env);
    if (concurrency < 1) concurrency = 1;

    const broadcastRecord = await sql`
      INSERT INTO public.admin_broadcasts (sender_id, target, title, content, content_type, channel, sent_count)
      VALUES (${sender.id}, ${validated.target}, ${validated.title}, ${validated.content}, ${validated.content_type}, ${validated.channel}, ${userList.length})
      RETURNING *
    `;
    const broadcastId = broadcastRecord[0]?.id;

    let sent = 0;
    let delivered = 0;
    const readCount = 0;
    let failed = 0;

    const results: any[] = [];
    const emailJobs: Promise<any>[] = [];
    const smsJobs: Promise<any>[] = [];
    let emailIndex = 0;
    let smsIndex = 0;

    for (const user of userList) {
      try {
        const insertResult = await sql`
          INSERT INTO public.admin_messages (sender_id, receiver_id, title, content, content_type, channel, status, broadcast_id, created_at, updated_at)
          VALUES (${sender.id}, ${user.id}, ${validated.title}, ${validated.content}, ${validated.content_type}, ${validated.channel}, 'sent', ${broadcastId}, NOW(), NOW())
          RETURNING *
        `;
        sent++;

        if (validated.sendEmail || validated.channel === 'email') {
          const job = (async () => {
            try {
              const idx = emailIndex++;
              await new Promise((resolve) => setTimeout(resolve, (idx % concurrency) * 100));
              const response = await sendEmailViaSelfHosted(env, {
                to: user.email,
                from: env.ADMIN_EMAIL_FROM || 'admin@sealify.ng',
                subject: validated.title,
                html: validated.content,
                text: validated.content,
                headers: { 'X-Broadcast-ID': broadcastId, 'X-Target-User': user.id },
              });
              if (response.success) delivered++;
            } catch (e: any) {
              failed++;
            }
          })();
          emailJobs.push(job);
        }

        if (validated.sendSms || validated.channel === 'sms') {
          const job = (async () => {
            try {
              const idx = smsIndex++;
              await new Promise((resolve) => setTimeout(resolve, (idx % concurrency) * 100));
              if (user.phone_number) {
                const response = await sendSmsViaSelfHosted(env, {
                  to: user.phone_number,
                  message: `${validated.title}: ${validated.content}`,
                });
                if (response.success) delivered++;
              } else {
                failed++;
              }
            } catch (e: any) {
              failed++;
            }
          })();
          smsJobs.push(job);
        }

        results.push({ userId: user.id, success: true });
      } catch (e: any) {
        failed++;
        results.push({ userId: user.id, success: false, error: e.message });
      }
    }

    await Promise.all([...emailJobs, ...smsJobs]);

    const sentAt = new Date().toISOString();
    await sql`
      UPDATE public.admin_broadcasts SET
        sent_at = ${sentAt},
        sent_count = ${sent},
        delivered_count = ${delivered},
        read_count = ${readCount},
        failed_count = ${failed}
      WHERE id = ${broadcastId}
    `;

    await auditLog(sql, sender.id, 'Admin Broadcast Sent', `Target: ${description}, Sent: ${sent}, Failed: ${failed}`, 'broadcast');

    return c.json({
      success: true,
      broadcastId,
      target: description,
      total: userList.length,
      sent,
      delivered,
      read: readCount,
      failed,
      results,
      timestamp: sentAt,
    });
  } catch (error: any) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) throw new HTTPException(400, { message: 'Validation failed', cause: error.errors });
    console.error('Admin broadcast error:', error);
    throw new HTTPException(500, { message: 'Failed to broadcast message' });
  }
});

messagingRoutes.get('/messages', requireAdmin, async (c) => {
  try {
    const sql = getSql(c.env);
    const { limit = '50', offset = '0', status } = c.req.query();
    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offsetNum = parseInt(offset) || 0;

    const statusClause = status ? sql`AND m.status = ${status}` : sql``;

    const messages = await sql`
      SELECT m.*, p.full_name as receiver_name, p.email as receiver_email, s.full_name as sender_name
      FROM public.admin_messages m
      LEFT JOIN public.profiles p ON m.receiver_id = p.id
      LEFT JOIN public.profiles s ON m.sender_id = s.id
      WHERE 1=1 ${statusClause}
      ORDER BY m.created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM public.admin_messages m
      WHERE 1=1 ${statusClause}
    `;

    return c.json({ messages, total: parseInt(countResult[0]?.total || '0'), limit: limitNum, offset: offsetNum });
  } catch (error: any) {
    console.error('Admin messages list error:', error);
    throw new HTTPException(500, { message: 'Failed to list messages' });
  }
});

messagingRoutes.get('/broadcasts', requireAdmin, async (c) => {
  try {
    const sql = getSql(c.env);
    const { limit = '50', offset = '0' } = c.req.query();
    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offsetNum = parseInt(offset) || 0;

    const broadcasts = await sql`
      SELECT b.*, s.full_name as sender_name, s.email as sender_email
      FROM public.admin_broadcasts b
      LEFT JOIN public.profiles s ON b.sender_id = s.id
      ORDER BY b.created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    const countResult = await sql`SELECT COUNT(*) as total FROM public.admin_broadcasts`;

    return c.json({ broadcasts, total: parseInt(countResult[0]?.total || '0'), limit: limitNum, offset: offsetNum });
  } catch (error: any) {
    console.error('Admin broadcasts list error:', error);
    throw new HTTPException(500, { message: 'Failed to list broadcasts' });
  }
});

messagingRoutes.get('/config', requireAdmin, async (c) => {
  try {
    const env = getEnv(c.env);
    return c.json({
      email: {
        configured: Boolean(env.SMTP_HOST),
        host: env.SMTP_HOST || null,
        from: env.EMAIL_FROM || env.ADMIN_EMAIL_FROM || null,
      },
      sms: {
        configured: Boolean(env.SMS_GATEWAY_URL),
        url: env.SMS_GATEWAY_URL || null,
      },
      otp: {
        length: parseInt(env.OTP_LENGTH || '6'),
        expiryMs: parseInt(env.OTP_EXPIRY_MS || '600000'),
      },
      broadcastConcurrency: parseInt(env.BROADCAST_CONCURRENCY || '10'),
    });
  } catch (error: any) {
    console.error('Admin config error:', error);
    throw new HTTPException(500, { message: 'Failed to get config' });
  }
});

export default messagingRoutes;
