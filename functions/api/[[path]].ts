import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import { z } from 'zod';

type Env = {
  HYPERDRIVE: Hyperdrive;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  JWT_SECRET: string;
};

type Hyperdrive = {
  connectionString: string;
};

type AppContext = {
  Variables: {
    sql: ReturnType<typeof postgres>;
    supabase: SupabaseClient;
    user: { id: string; email: string } | null;
    isAdmin: boolean;
  };
};

const app = new Hono<AppContext>();

app.use('*', cors({
  origin: ['https://sealify.ng', 'https://www.sealify.ng', 'https://sealify.pages.dev', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

function getSupabase(c: AppContext): SupabaseClient {
  const env = c.env;
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getSql(c: AppContext): ReturnType<typeof postgres> {
  const env = c.env;
  return postgres(env.HYPERDRIVE.connectionString, { max: 10, fetch_types: false, prepare: true });
}

class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

async function requireAuth(c: any, next: any) {
  const authHeader = c.req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authorization header required', 401);
  }
  const token = authHeader.substring(7);
  const supabase = getSupabase(c);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new AppError('Invalid or expired token', 401);
  c.set('user', { id: user.id, email: user.email || '' });
  c.set('supabase', supabase);
  await next();
}

async function requireAdmin(c: any, next: any) {
  const user = c.get('user');
  if (!user) throw new AppError('Authentication required', 401);
  const sql = getSql(c);
  const result = await sql`SELECT private.is_admin(${user.id}) AS is_admin`;
  if (!result[0]?.is_admin) throw new AppError('Administrator access required', 403);
  c.set('isAdmin', true);
  await next();
}

function handleError(err: Error, c: any) {
  if (err instanceof AppError) {
    return c.json({ error: err.message }, err.statusCode);
  }
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
}

app.onError((err, c) => handleError(err, c));

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password required'),
  accessKey: z.string().trim().min(1, 'Access key required').optional(),
});

app.post('/api/auth/admin-login', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) throw new AppError('Unable to authenticate administrator', 401);

    const accessKey = String(body?.accessKey ?? '').trim();
    const requiredAccessKey = (c.env.ADMIN_ACCESS_KEY || c.env.VITE_ADMIN_ACCESS_KEY || '336699').trim();
    if (!accessKey || accessKey !== requiredAccessKey) {
      throw new AppError('Unable to authenticate administrator', 401);
    }

    const configuredEmail = String(c.env.VITE_ADMIN_EMAIL || 'admin@sealify.ng').trim().toLowerCase();
    const configuredPassword = String(c.env.VITE_ADMIN_PASSWORD || 'sealify2027').trim();
    const localOverride =
      c.env.NODE_ENV !== 'production' &&
      parsed.data.email.trim().toLowerCase() === configuredEmail &&
      parsed.data.password.trim() === configuredPassword &&
      accessKey === requiredAccessKey;

    const supabase = getSupabase(c);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error || !data.user) throw new AppError('Unable to authenticate administrator', 401);

    if (localOverride || !c.env.HYPERDRIVE) {
      return c.json({ session: data.session });
    }

    const sql = getSql(c);
    const adminResult = await sql`SELECT private.is_admin(${data.user.id}) AS is_admin`;
    if (!adminResult[0]?.is_admin) throw new AppError('Unable to authenticate administrator', 401);

    return c.json({ session: data.session });
  } catch (err) {
    return handleError(err, c);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) throw new AppError('Invalid email or password', 400);

    const supabase = getSupabase(c);
    const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    if (error || !data.user) throw new AppError('Invalid email or password', 401);

    const sql = getSql(c);
    const result = await sql`SELECT * FROM profiles WHERE id = ${data.user.id}`;
    const profile = result[0] || null;

    return c.json({
      user: profile || { id: data.user.id, email: data.user.email, fullName: data.user.user_metadata?.full_name, role: 'buyer' },
      session: data.session,
    });
  } catch (err) {
    return handleError(err, c);
  }
});

app.get('/api/health', (c) => c.json({ status: 'ok' }));

const querySchema = z.object({
  category: z.string().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  searchQuery: z.string().optional(),
  sortBy: z.enum(["newest", "price-asc", "price-desc", "popular"]).optional(),
  status: z.enum(["active", "sold", "draft", "pending_review"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  featured: z.coerce.boolean().optional(),
});

app.get('/api/listings', async (c) => {
  try {
    const sql = getSql(c);
    const query = querySchema.parse(Object.fromEntries(c.req.query()));
    const { category, condition, location, minPrice, maxPrice, searchQuery, sortBy = "newest", status = "active", limit = "20", offset = "0", featured } = query;

    let whereClause = "WHERE a.status = $1";
    const params: any[] = [status];
    let paramIndex = 2;

    if (category && category !== "All") { whereClause += ` AND a.category_id = $${paramIndex}`; params.push(category); paramIndex++; }
    if (condition && condition !== "All") { whereClause += ` AND a.condition = $${paramIndex}`; params.push(condition); paramIndex++; }
    if (location) { whereClause += ` AND a.location ILIKE $${paramIndex}`; params.push(`%${location}%`); paramIndex++; }
    if (minPrice) { whereClause += ` AND a.price >= $${paramIndex}`; params.push(minPrice); paramIndex++; }
    if (maxPrice) { whereClause += ` AND a.price <= $${paramIndex}`; params.push(maxPrice); paramIndex++; }
    if (searchQuery) { whereClause += ` AND (a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex} OR a.category_id ILIKE $${paramIndex})`; params.push(`%${searchQuery}%`); paramIndex++; }
    if (featured === true) { whereClause += ` AND a.featured = true`; }

    let orderClause = "ORDER BY a.created_at DESC";
    if (sortBy === "price-asc") orderClause = "ORDER BY a.price ASC";
    else if (sortBy === "price-desc") orderClause = "ORDER BY a.price DESC";
    else if (sortBy === "popular") orderClause = "ORDER BY a.views_count DESC";

    const limitNum = Math.min(parseInt(String(limit)) || 20, 100);
    const offsetNum = parseInt(String(offset)) || 0;

    const listings = await sql`SELECT a.*, p.full_name as seller_name, CASE WHEN COALESCE(p.hide_phone_publicly, false) THEN NULL ELSE p.phone_number END as seller_phone, p.avatar_url as seller_avatar, p.verified as seller_verified, p.verification_type as seller_verification_type FROM ads a LEFT JOIN profiles p ON a.seller_id = p.id ${sql(whereClause)} ${sql(orderClause)} LIMIT ${limitNum} OFFSET ${offsetNum}`;
    const countResult = await sql`SELECT COUNT(*) as total FROM ads a ${sql(whereClause)}`;

    return c.json({ listings, total: parseInt(countResult[0]?.total || "0"), limit: limitNum, offset: offsetNum });
  } catch (err) {
    return handleError(err, c);
  }
});

app.get('/api/listings/meta/categories', async (c) => {
  try {
    const sql = getSql(c);
    const categories = await sql`SELECT category_id as category, COUNT(*) as count FROM ads WHERE status = 'active' GROUP BY category_id ORDER BY count DESC`;
    return c.json({ categories });
  } catch (err) {
    return handleError(err, c);
  }
});

app.get('/api/listings/:id', async (c) => {
  try {
    const sql = getSql(c);
    const id = c.req.param('id');
    const listing = await sql`SELECT a.*, p.full_name as seller_name, CASE WHEN COALESCE(p.hide_phone_publicly, false) THEN NULL ELSE p.phone_number END as seller_phone, p.avatar_url as seller_avatar, p.verified as seller_verified, p.verification_type as seller_verification_type FROM ads a LEFT JOIN profiles p ON a.seller_id = p.id WHERE a.id = ${id}`;
    if (listing.length === 0) throw new AppError('Listing not found', 404);
    await sql`UPDATE ads SET views_count = views_count + 1 WHERE id = ${id}`;
    return c.json({ listing: listing[0] });
  } catch (err) {
    return handleError(err, c);
  }
});

const createListingSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(5000),
  price: z.number().positive().max(100000000),
  category_id: z.string().min(1),
  subcategory_id: z.string().optional().nullable(),
  condition: z.enum(["Brand New", "Like New", "Used - Good", "Used - Fair"]),
  location: z.string().min(2).max(100),
  images: z.array(z.string().url()).min(1).max(10),
  video_url: z.string().url().optional().nullable(),
  specifications: z.record(z.string()).optional(),
});

app.post('/api/listings', requireAuth, async (c) => {
  try {
    const sql = getSql(c);
    const user = c.get('user')!;
    const body = await c.req.json();
    const validated = createListingSchema.parse(body);
    const { title, description, price, category_id, subcategory_id, condition, location, images, video_url, specifications = {} } = validated;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const postCount = await sql`SELECT COUNT(*) as count FROM ads WHERE seller_id = ${user.id} AND created_at >= ${todayStart.toISOString()}`;
    if (Number(postCount[0]?.count || 0) >= 10) throw new AppError('Daily post limit reached (10 ads/day)', 429);

    const result = await sql`INSERT INTO ads (seller_id, title, description, price, category_id, subcategory_id, condition, location, images, video_url, specifications, status, views_count, created_at, updated_at) VALUES (${user.id}, ${title}, ${description}, ${price}, ${category_id}, ${subcategory_id || null}, ${condition}, ${location}, ${images}, ${video_url || null}, ${JSON.stringify(specifications)}, 'active', 1, NOW(), NOW()) RETURNING *`;

    return c.json({ listing: result[0] }, 201);
  } catch (err) {
    return handleError(err, c);
  }
});

const updateListingSchema = createListingSchema.partial().extend({
  status: z.literal("sold").optional(),
});

app.put('/api/listings/:id', requireAuth, async (c) => {
  try {
    const sql = getSql(c);
    const user = c.get('user')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const validated = updateListingSchema.parse(body);

    const existing = await sql`SELECT seller_id FROM ads WHERE id = ${id}`;
    if (existing.length === 0) throw new AppError('Listing not found', 404);
    if (existing[0].seller_id !== user.id) throw new AppError('Not authorized to update this listing', 403);

    const allowedFields = ['title', 'description', 'price', 'category_id', 'subcategory_id', 'condition', 'location', 'images', 'video_url', 'specifications', 'status'];
    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if ((validated as any)[field] !== undefined) updates[field] = (validated as any)[field];
    }

    const result = await sql`UPDATE ads SET ${sql(updates)} WHERE id = ${id} RETURNING *`;
    return c.json({ listing: result[0] });
  } catch (err) {
    return handleError(err, c);
  }
});

app.delete('/api/listings/:id', requireAuth, async (c) => {
  try {
    const sql = getSql(c);
    const user = c.get('user')!;
    const id = c.req.param('id');

    const existing = await sql`SELECT seller_id FROM ads WHERE id = ${id}`;
    if (existing.length === 0) throw new AppError('Listing not found', 404);
    if (existing[0].seller_id !== user.id) throw new AppError('Not authorized to delete this listing', 403);

    await sql`DELETE FROM ads WHERE id = ${id}`;
    return c.json({ success: true });
  } catch (err) {
    return handleError(err, c);
  }
});

app.post('/api/listings/:id/featured', requireAuth, async (c) => {
  try {
    const sql = getSql(c);
    const user = c.get('user')!;
    const id = c.req.param('id');

    const existing = await sql`SELECT seller_id, featured FROM ads WHERE id = ${id}`;
    if (existing.length === 0) throw new AppError('Listing not found', 404);
    if (existing[0].seller_id !== user.id) throw new AppError('Not authorized', 403);

    const newFeatured = !existing[0].featured;
    const result = await sql`UPDATE ads SET featured = ${newFeatured}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
    return c.json({ listing: result[0] });
  } catch (err) {
    return handleError(err, c);
  }
});

app.get('/api/categories', async (c) => {
  try {
    const sql = getSql(c);
    const categories = await sql`SELECT * FROM categories ORDER BY name`;
    return c.json({ categories });
  } catch (err) {
    return handleError(err, c);
  }
});

app.get('/api/search', async (c) => {
  try {
    const sql = getSql(c);
    const q = c.req.query('q') || '';
    const limit = parseInt(c.req.query('limit') || '20');
    const results = await sql`SELECT a.*, p.full_name as seller_name FROM ads a LEFT JOIN profiles p ON a.seller_id = p.id WHERE a.status = 'active' AND (a.title ILIKE ${'%' + q + '%'} OR a.description ILIKE ${'%' + q + '%'}) ORDER BY a.created_at DESC LIMIT ${limit}`;
    return c.json({ results });
  } catch (err) {
    return handleError(err, c);
  }
});

app.get('/api/search/trending', async (c) => {
  try {
    const sql = getSql(c);
    const trending = await sql`SELECT a.*, p.full_name as seller_name FROM ads a LEFT JOIN profiles p ON a.seller_id = p.id WHERE a.status = 'active' ORDER BY a.views_count DESC LIMIT 10`;
    return c.json({ trending });
  } catch (err) {
    return handleError(err, c);
  }
});

app.get('/api/search/suggestions', async (c) => {
  try {
    const sql = getSql(c);
    const q = c.req.query('q') || '';
    const suggestions = await sql`SELECT DISTINCT title FROM ads WHERE status = 'active' AND title ILIKE ${'%' + q + '%'} LIMIT 5`;
    return c.json({ suggestions: suggestions.map((s: any) => s.title) });
  } catch (err) {
    return handleError(err, c);
  }
});

const adminRouter = new Hono<AppContext>();
adminRouter.use('*', requireAuth, requireAdmin);

adminRouter.get('/stats', async (c) => {
  try {
    const sql = getSql(c);
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
    return handleError(err, c);
  }
});

adminRouter.get('/users', async (c) => {
  try {
    const sql = getSql(c);
    const { search, role, status, verified, limit = '50', offset = '0' } = c.req.query();
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    if (search) { whereClause += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`; params.push(`%${search}%`); paramIndex++; }
    if (role) { whereClause += ` AND role = $${paramIndex}`; params.push(role); paramIndex++; }
    if (status) { whereClause += ` AND status = $${paramIndex}`; params.push(status); paramIndex++; }
    if (verified !== undefined) { whereClause += ` AND verified = $${paramIndex}`; params.push(verified === 'true'); paramIndex++; }
    const limitNum = Math.min(parseInt(limit as string) || 50, 200);
    const offsetNum = parseInt(offset as string) || 0;
    const users = await sql`SELECT * FROM profiles ${sql(whereClause)} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
    const countResult = await sql`SELECT COUNT(*) as total FROM profiles ${sql(whereClause)}`;
    return c.json({ users, total: parseInt(countResult[0]?.total || '0'), limit: limitNum, offset: offsetNum });
  } catch (err) {
    return handleError(err, c);
  }
});

adminRouter.post('/users', async (c) => {
  try {
    const sql = getSql(c);
    const body = await c.req.json();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const userRecord = {
      id,
      email: String(body.email || '').trim(),
      full_name: String(body.fullName || body.full_name || body.email || '').trim() || String(body.email || '').split('@')[0],
      phone_number: body.phoneNumber ?? body.phone_number ?? null,
      location: body.location ?? 'Ogbomoso, Oyo State',
      role: body.role ?? 'buyer',
      status: body.status ?? 'active',
      verified: Boolean(body.verified),
      verification_type: body.verificationType ?? body.verification_type ?? 'none',
      business_name: body.businessName ?? body.business_name ?? null,
      cac_number: body.cacNumber ?? body.cac_number ?? null,
      bio: body.bio ?? null,
      avatar_url: body.avatarUrl ?? body.avatar_url ?? null,
      cover_url: body.storeBannerUrl ?? body.cover_url ?? null,
      bank_name: body.bankName ?? body.bank_name ?? null,
      account_number: body.accountNumber ?? body.account_number ?? null,
      account_name: body.accountName ?? body.account_name ?? null,
      website_url: body.websiteUrl ?? body.website_url ?? null,
      instagram_handle: body.instagramHandle ?? body.instagram_handle ?? null,
      twitter_handle: body.twitterHandle ?? body.twitter_handle ?? null,
      whatsapp_number: body.whatsappNumber ?? body.whatsapp_number ?? null,
      email_notifications: body.emailNotifications ?? true,
      whatsapp_notifications: body.whatsappNotifications ?? true,
      hide_phone_publicly: body.hidePhonePublicly ?? false,
      hide_location_publicly: body.hideLocationPublicly ?? false,
      member_since: body.memberSince ?? now,
      created_at: now,
      updated_at: now,
    };

    if (!userRecord.email) {
      throw new Error('Email is required');
    }

    const result = await sql`INSERT INTO profiles ${sql(userRecord)} RETURNING *`;
    return c.json({ user: result[0] }, 201);
  } catch (err) {
    return handleError(err, c);
  }
});

app.route('/api/admin', adminRouter);

export default app;