import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getSql } from '../../_middleware/db';
import { requireAdmin } from '../../_middleware/auth';
import { auditLog } from '../../_middleware/admin-service';
import type { AppContext } from '../../_middleware/types';

export const adminRoutes = new Hono<AppContext>();

adminRoutes.use('*', requireAdmin);

const idSchema = z.string().uuid();
const moderationStatusSchema = z.enum(['pending', 'in_review', 'approved', 'rejected', 'resolved', 'dismissed']);
const adminUserUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone_number: z.string().max(20).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  store_banner_url: z.string().url().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  business_name: z.string().max(100).nullable().optional(),
  cac_number: z.string().max(100).nullable().optional(),
  business_hours: z.string().max(100).nullable().optional(),
  bank_name: z.string().max(100).nullable().optional(),
  account_number: z.string().max(30).nullable().optional(),
  account_name: z.string().max(100).nullable().optional(),
  website_url: z.string().url().nullable().optional(),
  instagram_handle: z.string().max(50).nullable().optional(),
  twitter_handle: z.string().max(50).nullable().optional(),
  whatsapp_number: z.string().max(20).nullable().optional(),
  email_notifications: z.boolean().optional(),
  whatsapp_notifications: z.boolean().optional(),
  hide_phone_publicly: z.boolean().optional(),
  hide_location_publicly: z.boolean().optional(),
  role: z.enum(['buyer', 'seller', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'banned', 'restricted']).optional(),
  verified: z.boolean().optional(),
  verification_type: z.enum(['individual', 'business', 'premium', 'student', 'none']).optional(),
  restriction_reason: z.string().max(500).nullable().optional(),
  appeal_status: z.enum(['none', 'pending', 'resolved']).optional(),
}).strict();

adminRoutes.get('/stats', async (c) => {
  try {
    const sql = getSql(c.env);
    const [users, listings, revenue, reports, disputes, verifications, promotions, passwords] = await Promise.all([
      sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active, COUNT(*) FILTER (WHERE verified = true) as verified, COUNT(*) FILTER (WHERE role = 'admin') as admins FROM profiles`,
      sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM ads`,
      sql`SELECT SUM(rate) as total FROM promotion_plans WHERE is_active = true`,
      sql`SELECT COUNT(*) as count FROM reports WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM disputes WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM verification_requests WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM promotion_payments WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM password_requests WHERE status = 'pending'`,
    ]);
    return c.json({
      users: users[0],
      listings: listings[0],
      revenue: revenue[0]?.total || 0,
      pending: {
        reports: reports[0]?.count || 0,
        disputes: disputes[0]?.count || 0,
        verifications: verifications[0]?.count || 0,
        promotions: promotions[0]?.count || 0,
        passwords: passwords[0]?.count || 0,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch admin stats' });
  }
});

adminRoutes.get('/users', async (c) => {
  try {
    const sql = getSql(c.env);
    const { search, role, status, verified, limit = '50', offset = '0' } = c.req.query();
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    if (search) {
      whereClause += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (role) { whereClause += ` AND role = $${paramIndex}`; params.push(role); paramIndex++; }
    if (status) { whereClause += ` AND status = $${paramIndex}`; params.push(status); paramIndex++; }
    if (verified !== undefined) { whereClause += ` AND verified = $${paramIndex}`; params.push(verified === 'true'); paramIndex++; }
    const limitNum = Math.min(parseInt(limit as string) || 50, 200);
    const offsetNum = parseInt(offset as string) || 0;
    const users = await sql`SELECT * FROM profiles ${sql(whereClause)} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    const countResult = await sql`SELECT COUNT(*) as total FROM profiles ${sql(whereClause)}`;
    return c.json({ users, total: parseInt(countResult[0]?.total || '0'), limit: limitNum, offset: offsetNum });
  } catch (err) {
    console.error('Admin get users error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch users' });
  }
});

adminRoutes.put('/users/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = idSchema.parse(c.req.param('id'));
    const body = await c.req.json();
    const updates: any = { updated_at: new Date(), ...adminUserUpdateSchema.parse(body) };
    const result = await sql`UPDATE profiles SET ${sql(updates)} WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'User not found' });
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'User Updated', `Updated user ${id}`, 'user');
    return c.json({ user: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin update user error:', err);
    throw new HTTPException(500, { message: 'Failed to update user' });
  }
});

adminRoutes.delete('/users/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const user = c.get('user')!;
    if (user.id === id) throw new HTTPException(400, { message: 'Cannot delete your own account' });
    await sql`DELETE FROM profiles WHERE id = ${id}`;
    await auditLog(sql, user.id, 'User Deleted', `Deleted user ${id}`, 'user');
    return c.json({ success: true });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin delete user error:', err);
    throw new HTTPException(500, { message: 'Failed to delete user' });
  }
});

adminRoutes.get('/listings', async (c) => {
  try {
    const sql = getSql(c.env);
    const { status = 'active', limit = '50', offset = '0' } = c.req.query();
    const listings = await sql`SELECT a.*, p.full_name as seller_name FROM ads a LEFT JOIN profiles p ON a.seller_id = p.id WHERE a.status = ${status} ORDER BY a.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ listings });
  } catch (err) {
    console.error('Admin get listings error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch listings' });
  }
});

adminRoutes.get('/reports', async (c) => {
  try {
    const sql = getSql(c.env);
    const { status = 'pending', limit = '50', offset = '0' } = c.req.query();
    const reports = await sql`SELECT r.*, p.full_name as reporter_name FROM reports r LEFT JOIN profiles p ON r.reporter_id = p.id WHERE r.status = ${status} ORDER BY r.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ reports });
  } catch (err) {
    console.error('Admin get reports error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch reports' });
  }
});

adminRoutes.put('/reports/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const status = z.enum(['resolved', 'dismissed']).parse(body.status);
    const admin_notes = z.string().max(2000).nullable().optional().parse(body.admin_notes);
    const result = await sql`UPDATE reports SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Report not found' });
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Report Processed', `Report ${id} ${status}`, 'security');
    return c.json({ report: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin update report error:', err);
    throw new HTTPException(500, { message: 'Failed to update report' });
  }
});

adminRoutes.get('/disputes', async (c) => {
  try {
    const sql = getSql(c.env);
    const { status = 'pending', limit = '50', offset = '0' } = c.req.query();
    const disputes = await sql`SELECT d.*, p.full_name as user_name FROM disputes d LEFT JOIN profiles p ON d.user_id = p.id WHERE d.status = ${status} ORDER BY d.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ disputes });
  } catch (err) {
    console.error('Admin get disputes error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch disputes' });
  }
});

adminRoutes.put('/disputes/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const status = z.enum(['in_review', 'resolved']).parse(body.status);
    const admin_notes = z.string().max(2000).nullable().optional().parse(body.admin_notes);
    const result = await sql`UPDATE disputes SET status = ${status}, admin_notes = ${admin_notes || null} WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Dispute not found' });
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Dispute Processed', `Dispute ${id} ${status}`, 'dispute');
    return c.json({ dispute: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin update dispute error:', err);
    throw new HTTPException(500, { message: 'Failed to update dispute' });
  }
});

adminRoutes.get('/verifications', async (c) => {
  try {
    const sql = getSql(c.env);
    const { status = 'pending', limit = '50', offset = '0' } = c.req.query();
    const verifications = await sql`SELECT * FROM verification_requests WHERE status = ${status} ORDER BY created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ verifications });
  } catch (err) {
    console.error('Admin get verifications error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch verifications' });
  }
});

adminRoutes.put('/verifications/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const status = z.enum(['approved', 'rejected']).parse(body.status);
    const admin_notes = z.string().max(2000).nullable().optional().parse(body.admin_notes);
    const result = await sql`UPDATE verification_requests SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Verification not found' });
    if (status === 'approved') {
      await sql`UPDATE profiles SET verified = true, verification_type = (SELECT type FROM verification_requests WHERE id = ${id}) WHERE id = (SELECT user_id FROM verification_requests WHERE id = ${id})`;
    }
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Verification Processed', `Verification ${id} ${status}`, 'verification');
    return c.json({ verification: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin update verification error:', err);
    throw new HTTPException(500, { message: 'Failed to update verification' });
  }
});

adminRoutes.get('/promotions', async (c) => {
  try {
    const sql = getSql(c.env);
    const { status = 'pending', limit = '50', offset = '0' } = c.req.query();
    const promotions = await sql`SELECT pp.*, p.full_name as user_name FROM promotion_payments pp LEFT JOIN profiles p ON pp.user_id = p.id WHERE pp.status = ${status} ORDER BY pp.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ promotions });
  } catch (err) {
    console.error('Admin get promotions error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch promotions' });
  }
});

adminRoutes.put('/promotions/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const status = z.enum(['approved', 'rejected']).parse(body.status);
    const admin_notes = z.string().max(2000).nullable().optional().parse(body.admin_notes);
    const result = await sql`UPDATE promotion_payments SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Promotion not found' });
    if (status === 'approved') {
      await sql`UPDATE ads SET featured = true, promotion_plan_name = (SELECT plan_name FROM promotion_payments WHERE id = ${id}), promotion_duration_months = (SELECT duration_months FROM promotion_payments WHERE id = ${id}), promotion_start_date = NOW(), promotion_end_date = NOW() + INTERVAL '1 month' * (SELECT duration_months FROM promotion_payments WHERE id = ${id}) WHERE id = (SELECT ad_id FROM promotion_payments WHERE id = ${id})`;
    }
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Promotion Processed', `Promotion ${id} ${status}`, 'finance');
    return c.json({ promotion: result[0] });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin update promotion error:', err);
    throw new HTTPException(500, { message: 'Failed to update promotion' });
  }
});

adminRoutes.get('/passwords', async (c) => {
  try {
    const sql = getSql(c.env);
    const { status = 'pending', limit = '50', offset = '0' } = c.req.query();
    const passwords = await sql`SELECT * FROM password_requests WHERE status = ${status} ORDER BY created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ passwords });
  } catch (err) {
    console.error('Admin get passwords error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch password requests' });
  }
});

adminRoutes.put('/passwords/:id', async (c) => {
  try {
    const sql = getSql(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const { status, admin_notes } = body;
    const result = await sql`UPDATE password_requests SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *`;
    if (result.length === 0) throw new HTTPException(404, { message: 'Password request not found' });
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Password Request Processed', `Password request ${id} ${status}`, 'security');
    return c.json({ password: result[0] });
  } catch (err) {
    console.error('Admin update password error:', err);
    throw new HTTPException(500, { message: 'Failed to update password request' });
  }
});

adminRoutes.get('/audit-logs', async (c) => {
  try {
    const sql = getSql(c.env);
    const { type, limit = '100', offset = '0' } = c.req.query();
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    if (type) { whereClause += ` AND type = $${paramIndex}`; params.push(type); paramIndex++; }
    const logs = await sql`SELECT al.*, p.full_name as user_name FROM audit_logs al LEFT JOIN profiles p ON al.user_id = p.id ${sql(whereClause)} ORDER BY al.created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ logs });
  } catch (err) {
    console.error('Admin get audit logs error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch audit logs' });
  }
});

adminRoutes.get('/intrusion-logs', async (c) => {
  try {
    const sql = getSql(c.env);
    const { limit = '100', offset = '0' } = c.req.query();
    const logs = await sql`SELECT * FROM intrusion_logs ORDER BY created_at DESC LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;
    return c.json({ logs });
  } catch (err) {
    console.error('Admin get intrusion logs error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch intrusion logs' });
  }
});

adminRoutes.get('/system-config', async (c) => {
  try {
    const sql = getSql(c.env);
    const configs = await sql`SELECT * FROM system_configs ORDER BY key`;
    return c.json({ configs });
  } catch (err) {
    console.error('Admin get system config error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch system config' });
  }
});

adminRoutes.put('/system-config', async (c) => {
  try {
    const sql = getSql(c.env);
    const body = await c.req.json();
    for (const [key, value] of Object.entries(body)) {
      const typedValue = value as boolean | number | string;
      await sql`INSERT INTO system_configs (key, value, description) VALUES (${key}, ${typedValue}, '') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
    }
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'System Config Updated', `Updated config: ${Object.keys(body).join(', ')}`, 'security');
    return c.json({ success: true });
  } catch (err) {
    console.error('Admin update system config error:', err);
    throw new HTTPException(500, { message: 'Failed to update system config' });
  }
});

adminRoutes.get('/site-settings', async (c) => {
  try {
    const sql = getSql(c.env);
    const settings = await sql`SELECT * FROM site_settings ORDER BY key`;
    return c.json({ settings });
  } catch (err) {
    console.error('Admin get site settings error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch site settings' });
  }
});

adminRoutes.put('/site-settings', async (c) => {
  try {
    const sql = getSql(c.env);
    const body = await c.req.json();
    for (const [key, value] of Object.entries(body)) {
      const typedValue = value as string;
      await sql`INSERT INTO site_settings (key, value, description) VALUES (${key}, ${typedValue}, '') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
    }
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Site Settings Updated', `Updated settings: ${Object.keys(body).join(', ')}`, 'settings');
    return c.json({ success: true });
  } catch (err) {
    console.error('Admin update site settings error:', err);
    throw new HTTPException(500, { message: 'Failed to update site settings' });
  }
});

adminRoutes.post('/users', async (c) => {
  try {
    const sql = getSql(c.env);
    const body = await c.req.json();
    const {
      email,
      password = 'TempPass123!',
      fullName,
      full_name,
      phoneNumber,
      phone_number,
      location = 'Ogbomoso, Oyo State',
      role = 'buyer',
      status = 'active',
      verified = false,
      verificationType = 'none',
      verification_type = 'none',
      businessName,
      business_name,
      cacNumber,
      cac_number,
      bio,
      avatarUrl,
      avatar_url,
      storeBannerUrl,
      store_banner_url,
      bankName,
      bank_name,
      accountNumber,
      account_number,
      accountName,
      account_name,
      websiteUrl,
      website_url,
      instagramHandle,
      instagram_handle,
      twitterHandle,
      twitter_handle,
      whatsappNumber,
      whatsapp_number,
      emailNotifications = true,
      email_notifications = true,
      whatsappNotifications = true,
      whatsapp_notifications = true,
      hidePhonePublicly = false,
      hide_phone_publicly = false,
      hideLocationPublicly = false,
      hide_location_publicly = false,
    } = body;

    const finalFullName = fullName || full_name;
    const finalPhone = phoneNumber || phone_number;
    const finalLocation = location;
    const finalRole = role;
    const finalStatus = status;
    const finalVerified = verified;
    const finalVerificationType = verificationType || verification_type;
    const finalBusinessName = businessName || business_name;
    const finalCacNumber = cacNumber || cac_number;
    const finalBio = bio;
    const finalAvatarUrl = avatarUrl || avatar_url;
    const finalStoreBannerUrl = storeBannerUrl || store_banner_url;
    const finalBankName = bankName || bank_name;
    const finalAccountNumber = accountNumber || account_number;
    const finalAccountName = accountName || account_name;
    const finalWebsiteUrl = websiteUrl || website_url;
    const finalInstagramHandle = instagramHandle || instagram_handle;
    const finalTwitterHandle = twitterHandle || twitter_handle;
    const finalWhatsappNumber = whatsappNumber || whatsapp_number;
    const finalEmailNotifications = emailNotifications ?? email_notifications ?? true;
    const finalWhatsappNotifications = whatsappNotifications ?? whatsapp_notifications ?? true;
    const finalHidePhonePublicly = hidePhonePublicly ?? hide_phone_publicly ?? false;
    const finalHideLocationPublicly = hideLocationPublicly ?? hide_location_publicly ?? false;

    if (!email || !finalFullName) {
      throw new HTTPException(400, { message: 'Email and fullName are required' });
    }

    // Check if user already exists
    const existing = await sql`SELECT id FROM profiles WHERE email = ${email}`;
    if (existing.length > 0) {
      throw new HTTPException(409, { message: 'Email already registered' });
    }

    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: finalFullName, phone: finalPhone }
    });

    if (authError) {
      throw new HTTPException(400, { message: authError.message });
    }

    if (!authData.user) {
      throw new HTTPException(500, { message: 'Failed to create user' });
    }

    const userId = authData.user.id;

    await sql`
      INSERT INTO profiles (
        id, email, full_name, phone_number, role, status, location, 
        verified, verification_type, business_name, cac_number, bio,
        avatar_url, store_banner_url, bank_name, account_number, account_name,
        website_url, instagram_handle, twitter_handle, whatsapp_number,
        email_notifications, whatsapp_notifications, hide_phone_publicly, hide_location_publicly,
        created_at, updated_at
      ) VALUES (
        ${userId}, ${email}, ${finalFullName}, ${finalPhone || null}, ${finalRole}, ${finalStatus}, ${finalLocation},
        ${finalVerified}, ${finalVerificationType}, ${finalBusinessName || null}, ${finalCacNumber || null}, ${finalBio || null},
        ${finalAvatarUrl || null}, ${finalStoreBannerUrl || null}, ${finalBankName || null}, ${finalAccountNumber || null}, ${finalAccountName || null},
        ${finalWebsiteUrl || null}, ${finalInstagramHandle || null}, ${finalTwitterHandle || null}, ${finalWhatsappNumber || null},
        ${finalEmailNotifications}, ${finalWhatsappNotifications}, ${finalHidePhonePublicly}, ${finalHideLocationPublicly},
        NOW(), NOW()
      )
    `;

    await sql`
      INSERT INTO user_settings (user_id, email_notifications, whatsapp_notifications, push_notifications, price_drop_alerts, new_message_alerts, weekly_digest, promotion_expiry_reminders, language, theme, created_at, updated_at)
      VALUES (${userId}, ${finalEmailNotifications}, ${finalWhatsappNotifications}, true, true, true, true, true, 'en', 'dark', NOW(), NOW())
      ON CONFLICT (user_id) DO NOTHING
    `;

    const user = c.get('user')!;
    await auditLog(sql, user.id, 'User Created', `Created user ${email} with role ${finalRole}`, 'user');

    return c.json({ user: { id: userId, email, fullName: finalFullName, role: finalRole, status: finalStatus } }, 201);
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin create user error:', err);
    throw new HTTPException(500, { message: 'Failed to create user' });
  }
});

adminRoutes.post('/email-digest', async (c) => {
  try {
    const sql = getSql(c.env);
    const body = await c.req.json();
    const { subject, content, targetRole } = body;

    if (!subject || !content) {
      throw new HTTPException(400, { message: 'Subject and content are required' });
    }

    let userIds: string[];
    if (targetRole && targetRole !== 'all') {
      const users = await sql`SELECT id FROM profiles WHERE role = ${targetRole}`;
      userIds = users.map((r: any) => r.id);
    } else {
      const users = await sql`SELECT id FROM profiles`;
      userIds = users.map((r: any) => r.id);
    }

    // Store as notifications for now (email sending would need a separate service)
    for (const userId of userIds) {
      await sql`INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (${userId}, ${subject}, ${content}, 'email_digest', NOW())`;
    }

    const user = c.get('user')!;
    await auditLog(sql, user.id, 'Email Digest Sent', `Sent to ${userIds.length} users (role: ${targetRole || 'all'})`, 'notification');

    return c.json({ success: true, recipients: userIds.length });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Admin email digest error:', err);
    throw new HTTPException(500, { message: 'Failed to send email digest' });
  }
});

adminRoutes.get('/ai-settings', async (c) => {
  try {
    const sql = getSql(c.env);
    const configs = await sql`SELECT key, value FROM system_configs WHERE key LIKE 'ai_%' ORDER BY key`;
    return c.json({ settings: configs });
  } catch (err) {
    console.error('Admin get AI settings error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch AI settings' });
  }
});

adminRoutes.put('/ai-settings', async (c) => {
  try {
    const sql = getSql(c.env);
    const body = await c.req.json();
    for (const [key, value] of Object.entries(body)) {
      if (key.startsWith('ai_')) {
        const typedValue = value as boolean | number | string;
        await sql`INSERT INTO system_configs (key, value, description) VALUES (${key}, ${typedValue}, 'AI setting') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
      }
    }
    const user = c.get('user')!;
    await auditLog(sql, user.id, 'AI Settings Updated', `Updated AI settings: ${Object.keys(body).join(', ')}`, 'settings');
    return c.json({ success: true });
  } catch (err) {
    console.error('Admin update AI settings error:', err);
    throw new HTTPException(500, { message: 'Failed to update AI settings' });
  }
});

adminRoutes.post('/ai-settings/test', async (c) => {
  try {
    const body = await c.req.json();
    const { provider, apiKey, model, baseUrl, testPrompt } = body;
    const testMessage = testPrompt || 'Hello, this is a test message from Sealify Admin.';
    const normalizedProvider = String(provider || 'sealify').toLowerCase();

    if (normalizedProvider === 'sealify' || normalizedProvider === 'local') {
      const url = `${String(baseUrl || 'http://localhost:11434').replace(/\/$/, '')}/api/chat`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'llama3.1',
          messages: [{ role: 'user', content: testMessage }],
          stream: false,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: { message: 'Local model test failed' } }));
        throw new HTTPException(res.status, { message: payload?.error?.message || 'Local model test failed' });
      }

      return c.json({ success: true, message: 'Local model connection is ready.' });
    }

    if (!normalizedProvider || (normalizedProvider !== 'sealify' && normalizedProvider !== 'local' && !apiKey)) {
      throw new HTTPException(400, { message: 'Provider and API key are required' });
    }

    let response: any;
    if (normalizedProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: model || 'gpt-4o-mini', messages: [{ role: 'user', content: testMessage }], max_tokens: 50 }),
      });
      response = await res.json();
    } else if (normalizedProvider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: testMessage }] }], generationConfig: { maxOutputTokens: 50 } }),
      });
      response = await res.json();
    } else {
      throw new HTTPException(400, { message: 'Invalid provider' });
    }

    return c.json({ success: true, response });
  } catch (err) {
    console.error('Admin AI settings test error:', err);
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(500, { message: 'Failed to test AI settings' });
  }
});

adminRoutes.get('/schema', async (c) => {
  try {
    const sql = getSql(c.env);
    const tables = await sql`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `;
    return c.json({ schema: tables });
  } catch (err) {
    console.error('Admin get schema error:', err);
    throw new HTTPException(500, { message: 'Failed to fetch database schema' });
  }
});

export default adminRoutes;