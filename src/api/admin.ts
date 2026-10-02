import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSql } from "../db/hyperdrive";
import { maskSecret, resolveAiConfig, setRuntimeAiConfig, isModelSupported, type SupportedAIProvider } from "../lib/ai/providers";
import { requireAdmin, auditLog, rateLimit } from "../middleware/security";
import { z } from "zod";
import {
  DEFAULT_SITE_METADATA,
  EDITABLE_PAGE_DEFINITIONS,
  buildHeadHtml,
  cleanText,
  mergeSiteMetadata,
  resolveMetadata,
  siteMetadataUpdateSchema,
  type SiteMetadata,
} from "../lib/siteMetadata";
import {
  getSiteOrigin,
  invalidateSiteMetadataCacheFor,
  loadSiteMetadata,
  saveSiteMetadata,
} from "../server/siteMetadataStore";

export const adminRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql>; user: any; supabase: any; profile: any } }>();

// Apply rate limiting to all admin routes
adminRoutes.use("/*", rateLimit({ windowMs: 60000, maxRequests: 100 })); // 100 req/min
// Every admin endpoint requires a Supabase Auth bearer token and an admin
// profile. There is intentionally no custom admin login or token format.
adminRoutes.use("/*", requireAdmin);

const idSchema = z.string().uuid();
const moderationStatusSchema = z.enum(["pending", "in_review", "approved", "rejected", "resolved", "dismissed"]);
const adminUserUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(), phone_number: z.string().max(20).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(), store_banner_url: z.string().url().nullable().optional(),
  bio: z.string().max(500).nullable().optional(), location: z.string().max(100).nullable().optional(),
  business_name: z.string().max(100).nullable().optional(), cac_number: z.string().max(100).nullable().optional(),
  business_hours: z.string().max(100).nullable().optional(), bank_name: z.string().max(100).nullable().optional(),
  account_number: z.string().max(30).nullable().optional(), account_name: z.string().max(100).nullable().optional(),
  website_url: z.string().url().nullable().optional(), instagram_handle: z.string().max(50).nullable().optional(),
  twitter_handle: z.string().max(50).nullable().optional(), whatsapp_number: z.string().max(20).nullable().optional(),
  email_notifications: z.boolean().optional(), whatsapp_notifications: z.boolean().optional(),
  hide_phone_publicly: z.boolean().optional(), hide_location_publicly: z.boolean().optional(),
  role: z.enum(["buyer", "seller", "admin"]).optional(), status: z.enum(["active", "suspended", "banned", "restricted"]).optional(),
  verified: z.boolean().optional(), verification_type: z.enum(["individual", "business", "premium", "student", "none"]).optional(),
  restriction_reason: z.string().max(500).nullable().optional(), appeal_status: z.enum(["none", "pending", "resolved"]).optional(),
}).strict();

const adminUserCreateSchema = z.object({
  email: z.string().trim().email(),
  full_name: z.string().trim().min(2).max(100).optional(),
  phone_number: z.string().trim().max(20).nullable().optional(),
  location: z.string().trim().max(100).nullable().optional(),
  role: z.enum(["buyer", "seller", "admin"]).optional().default("buyer"),
  status: z.enum(["active", "suspended", "banned", "restricted"]).optional().default("active"),
  verified: z.boolean().optional().default(false),
  verification_type: z.enum(["individual", "business", "premium", "student", "none"]).optional().default("none"),
  business_name: z.string().trim().max(100).nullable().optional(),
  cac_number: z.string().trim().max(100).nullable().optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  avatar_url: z.string().trim().url().nullable().optional(),
  cover_url: z.string().trim().url().nullable().optional(),
  bank_name: z.string().trim().max(100).nullable().optional(),
  account_number: z.string().trim().max(30).nullable().optional(),
  account_name: z.string().trim().max(100).nullable().optional(),
  website_url: z.string().trim().url().nullable().optional(),
  instagram_handle: z.string().trim().max(50).nullable().optional(),
  twitter_handle: z.string().trim().max(50).nullable().optional(),
  whatsapp_number: z.string().trim().max(20).nullable().optional(),
  email_notifications: z.boolean().optional().default(true),
  whatsapp_notifications: z.boolean().optional().default(true),
  hide_phone_publicly: z.boolean().optional().default(false),
  hide_location_publicly: z.boolean().optional().default(false),
  member_since: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}).strict();

const DEFAULT_ADSENSE_CONFIG = {
  enabled: false,
  clientId: "ca-pub-1826576243729056",
  autoAdsEnabled: false,
  homeSlot: "",
  listingsSlot: "",
  listingsSidebarSlot: "",
  listingDetailSlot: "",
};

const adsenseConfigSchema = z.object({
  enabled: z.boolean().default(false),
  clientId: z.string().trim().max(200).default("ca-pub-1826576243729056"),
  autoAdsEnabled: z.boolean().default(false),
  homeSlot: z.string().trim().max(200).default(""),
  listingsSlot: z.string().trim().max(200).default(""),
  listingsSidebarSlot: z.string().trim().max(200).default(""),
  listingDetailSlot: z.string().trim().max(200).default(""),
}).strict();

const loadAdSenseConfig = async (sql: ReturnType<typeof getSql>) => {
  const rows = await sql`SELECT value FROM system_configs WHERE key = 'adsense_config' LIMIT 1`;
  const stored = rows[0]?.value;
  if (!stored || typeof stored !== "object") return { ...DEFAULT_ADSENSE_CONFIG };
  const parsed = adsenseConfigSchema.safeParse(stored);
  return parsed.success ? parsed.data : { ...DEFAULT_ADSENSE_CONFIG };
};

const persistAdSenseConfig = async (sql: ReturnType<typeof getSql>, input: Record<string, unknown>) => {
  const config = adsenseConfigSchema.parse({
    ...DEFAULT_ADSENSE_CONFIG,
    ...(typeof input === "object" && input ? input : {}),
  });

  await sql`
    INSERT INTO system_configs (key, value, description)
    VALUES ('adsense_config', ${config}::jsonb, 'Google AdSense placement configuration')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
  `;

  return config;
};

// Get admin stats
adminRoutes.get("/stats", async (c) => {
  const sql = getSql(c.env);

  const [
    users,
    listings,
    revenue,
    reports,
    disputes,
    verifications,
    promotions,
    passwords,
  ] = await Promise.all([
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
    }
  });
});

// User management
adminRoutes.get("/users", async (c) => {
  const sql = getSql(c.env);
  const { search, role, status, verified, limit = "50", offset = "0" } = c.req.query();

  let whereClause = "WHERE 1=1";
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    whereClause += ` AND (p.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR p.location ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (role) {
    whereClause += ` AND p.role = $${paramIndex}`;
    params.push(role);
    paramIndex++;
  }

  if (status) {
    whereClause += ` AND p.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (verified !== undefined) {
    whereClause += ` AND p.verified = $${paramIndex}`;
    params.push(verified === "true");
    paramIndex++;
  }

  const limitNum = Math.min(parseInt(limit) || 50, 200);
  const offsetNum = parseInt(offset) || 0;

  const limitParam = paramIndex;
  const offsetParam = paramIndex + 1;
  const allParams = [...params, limitNum, offsetNum];

  const users = await sql.unsafe(`
    SELECT
      u.id AS auth_user_id,
      u.email AS auth_email,
      u.email_confirmed_at,
      u.last_sign_in_at,
      p.id,
      p.full_name,
      p.phone_number,
      p.role,
      p.verified,
      p.verification_type,
      p.avatar_url,
      p.cover_url,
      p.store_banner_url,
      p.bio,
      p.location,
      p.member_since,
      p.status,
      p.created_at,
      p.updated_at,
      p.restriction_reason,
      p.appeal_status,
      p.total_value_traded,
      p.completed_deals,
      p.email_notifications,
      p.whatsapp_notifications,
      p.hide_phone_publicly,
      p.hide_location_publicly,
      p.business_name,
      p.business_category,
      p.business_address,
      p.cac_number,
      p.business_hours,
      p.bank_name,
      p.account_number,
      p.account_name,
      p.website_url,
      p.instagram_handle,
      p.twitter_handle,
      p.whatsapp_number
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `, allParams);

  const countResult = await sql.unsafe(`
    SELECT COUNT(*) as total FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id ${whereClause}
  `, params);

  return c.json({
    users,
    total: parseInt(countResult[0]?.total || "0"),
    limit: limitNum,
    offset: offsetNum
  });
});

// POST /api/admin/users - Disabled due to lack of secure Supabase Auth Admin secret
// Creating users requires Auth user creation which cannot be done securely without service role key
adminRoutes.post("/users", async (c) => {
  return c.json({ error: "User creation disabled: Secure Auth user creation not available" }, 501);
});

adminRoutes.put("/users/:id", async (c) => {
  const sql = getSql(c.env);
  const id = c.req.param("id");
  const updates: any = { updated_at: new Date(), ...adminUserUpdateSchema.parse(await c.req.json()) };

  // Prevent non-admin from changing role
  const user = c.get("user");
  if (user && user.id !== id && updates.role !== undefined && !userIsAdmin(user.id, sql)) {
    throw new HTTPException(403, { message: "Only administrators can change roles" });
  }

  const setEntries = Object.entries(updates).filter(([key]) => key !== "updated_at");
  const setClause = setEntries.map(([key], i) => `${key} = $${i + 1}`).join(", ");
  const values = setEntries.map(([, value]) => value);

  const result = await sql.unsafe(`
    UPDATE profiles SET ${setClause}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *
  `, [...values, id]);

  if (result.length === 0) {
    throw new HTTPException(404, { message: "User not found" });
  }

  await auditLog(sql, c.get("user").id, "User Updated", `Updated user ${id}`, "user");

  return c.json({ user: result[0] });
});

adminRoutes.patch("/users/bulk", async (c) => {
  const sql = getSql(c.env);
  const body = await c.req.json();
  const { ids, data } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new HTTPException(400, { message: "No user IDs provided" });
  }

  // Verify requesting user is admin
  const adminUser = c.get("user");
  if (!adminUser || !userIsAdmin(adminUser.id, sql)) {
    throw new HTTPException(403, { message: "Administrator access required" });
  }

  // Prevent self-deletion and removing the last admin
  const adminCount = await sql`SELECT COUNT(*) as cnt FROM profiles WHERE role = 'admin'`.then(r => parseInt(r[0]?.cnt || "0"));

  const updateIds = ids.filter(id => {
    // Allow updating any ID except the current admin if it would remove the last admin
    if (adminUser?.id === id && adminCount <= 1) {
      return false;
    }
    return true;
  });

  if (updateIds.length === 0) {
    throw new HTTPException(400, { message: "Cannot perform this operation on the selected users" });
  }

  const updates: any = { updated_at: new Date(), ...adminUserUpdateSchema.parse(data || {}) };
  const updateEntries = Object.entries(updates).filter(([key]) => key !== "updated_at");
  if (updateEntries.length === 0) throw new HTTPException(400, { message: "No updates provided" });

  const placeholders = updateIds.map((_, i) => `$${i + 1}`).join(',');
  const query = `UPDATE profiles SET ${updateEntries.map(([k], i) => `${k} = $${ids.length + i + 1}`).join(', ')}, updated_at = NOW() WHERE id IN (${placeholders})`;
  const values = [...updateIds, ...updateEntries.map(([, value]) => value)];

  await sql.unsafe(query, values);
  await auditLog(sql, c.get("user").id, "Bulk User Update", `Updated ${updateIds.length} users`, "user");

  return c.json({ success: true, updated: updateIds.length });
});

adminRoutes.delete("/users/:id", async (c) => {
  const sql = getSql(c.env);
  const id = c.req.param("id");
  const adminUser = c.get("user");

  // Prevent self-deletion
  if (adminUser && adminUser.id === id) {
    throw new HTTPException(400, { message: "Cannot delete your own account" });
  }

  // Instead of deleting the Auth user, mark profile as restricted
  // Auth user remains intact - prevents orphaned Auth accounts
  const result = await sql`
    UPDATE profiles SET status = 'restricted', updated_at = NOW() WHERE id = ${id} RETURNING *
  `;

  if (result.length === 0) {
    throw new HTTPException(404, { message: "User not found" });
  }

  await auditLog(sql, adminUser?.id || "unknown", "User Restricted", `Restricted user ${id}`, "user");

  return c.json({ user: result[0], note: "Profile restricted; Auth account preserved to prevent orphaned authentication sessions." });
});

function userIsAdmin(userId: string, sql: any): Promise<boolean> {
  return sql`SELECT public.is_admin(${userId}) AS is_admin`.then(r => Boolean(r[0]?.is_admin));
}

adminRoutes.post("/users/bulk", async (c) => {
  const sql = getSql(c.env);
  const body = await c.req.json();
  const { ids, data } = body;

  if (!Array.isArray(ids) || ids.length === 0 || ids.some((id: unknown) => !idSchema.safeParse(id).success)) {
    throw new HTTPException(400, { message: "No user IDs provided" });
  }

  const updates: any = { updated_at: new Date(), ...adminUserUpdateSchema.parse(data || {}) };
  const updateEntries = Object.entries(updates).filter(([key]) => key !== "updated_at");
  if (updateEntries.length === 0) throw new HTTPException(400, { message: "No updates provided" });

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const query = `UPDATE profiles SET ${updateEntries.map(([k], i) => `${k} = $${ids.length + i + 1}`).join(', ')}, updated_at = NOW() WHERE id IN (${placeholders})`;
  const values = [...ids, ...updateEntries.map(([, value]) => value)];

  await sql.unsafe(query, values);
  await auditLog(sql, c.get("user").id, "Bulk User Update", `Updated ${ids.length} users`, "user");

  return c.json({ success: true, updated: ids.length });
});

// Listings management
adminRoutes.get("/listings", async (c) => {
  const sql = getSql(c.env);
  const { status = "active", limit = "50", offset = "0" } = c.req.query();

  const listings = await sql`
    SELECT a.*, p.full_name as seller_name
    FROM ads a
    LEFT JOIN profiles p ON a.seller_id = p.id
    WHERE a.status = ${status}
    ORDER BY a.created_at DESC
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
  `;

  return c.json({ listings });
});

// Reports management
adminRoutes.get("/reports", async (c) => {
  const sql = getSql(c.env);
  const { status = "pending", limit = "50", offset = "0" } = c.req.query();

  const reports = await sql`
    SELECT r.*, p.full_name as reporter_name
    FROM reports r
    LEFT JOIN profiles p ON r.reporter_id = p.id
    WHERE r.status = ${status}
    ORDER BY r.created_at DESC
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
  `;

  return c.json({ reports });
});

adminRoutes.put("/reports/:id", async (c) => {
  const sql = getSql(c.env);
  const id = c.req.param("id");
  const body = await c.req.json();
  const status = z.enum(["resolved", "dismissed"]).parse(body.status);
  const admin_notes = z.string().max(2000).nullable().optional().parse(body.admin_notes);

  const result = await sql`
    UPDATE reports SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *
  `;

  if (result.length === 0) {
    throw new HTTPException(404, { message: "Report not found" });
  }

  await auditLog(sql, c.get("user").id, "Report Processed", `Report ${id} ${status}`, "security");

  return c.json({ report: result[0] });
});

// Disputes management
adminRoutes.get("/disputes", async (c) => {
  const sql = getSql(c.env);
  const { status = "pending", limit = "50", offset = "0" } = c.req.query();

  const disputes = await sql`
    SELECT d.*, p.full_name as user_name
    FROM disputes d
    LEFT JOIN profiles p ON d.user_id = p.id
    WHERE d.status = ${status}
    ORDER BY d.created_at DESC
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
  `;

  return c.json({ disputes });
});

adminRoutes.put("/disputes/:id", async (c) => {
  const sql = getSql(c.env);
  const id = c.req.param("id");
  const body = await c.req.json();
  const status = z.enum(["in_review", "resolved"]).parse(body.status);
  const admin_notes = z.string().max(2000).nullable().optional().parse(body.admin_notes);

  const result = await sql`
    UPDATE disputes SET status = ${status}, admin_notes = ${admin_notes || null}, ${status === 'resolved' ? 'resolved_at = NOW()' : ''} WHERE id = ${id} RETURNING *
  `;

  if (result.length === 0) {
    throw new HTTPException(404, { message: "Dispute not found" });
  }

  await auditLog(sql, c.get("user").id, "Dispute Processed", `Dispute ${id} ${status}`, "dispute");

  return c.json({ dispute: result[0] });
});

// Verification requests
adminRoutes.get("/verifications", async (c) => {
  const sql = getSql(c.env);
  const { status = "pending", limit = "50", offset = "0" } = c.req.query();

  const verifications = await sql`
    SELECT * FROM verification_requests
    WHERE status = ${status}
    ORDER BY created_at DESC
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
  `;

  return c.json({ verifications });
});

adminRoutes.put("/verifications/:id", async (c) => {
  const sql = getSql(c.env);
  const id = c.req.param("id");
  const body = await c.req.json();
  const status = z.enum(["approved", "rejected"]).parse(body.status);
  const admin_notes = z.string().max(2000).nullable().optional().parse(body.admin_notes);

  const result = await sql`
    UPDATE verification_requests SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *
  `;

  if (result.length === 0) {
    throw new HTTPException(404, { message: "Verification not found" });
  }

  // If approved, update user profile
  if (status === 'approved') {
    await sql`
      UPDATE profiles SET verified = true, verification_type = (SELECT type FROM verification_requests WHERE id = ${id}) WHERE id = (SELECT user_id FROM verification_requests WHERE id = ${id})
    `;
  }

  await auditLog(sql, c.get("user").id, "Verification Processed", `Verification ${id} ${status}`, "verification");

  return c.json({ verification: result[0] });
});

// Promotion payments
adminRoutes.get("/promotions", async (c) => {
  const sql = getSql(c.env);
  const { status = "pending", limit = "50", offset = "0" } = c.req.query();

  const promotions = await sql`
    SELECT pp.*, p.full_name as user_name
    FROM promotion_payments pp
    LEFT JOIN profiles p ON pp.user_id = p.id
    WHERE pp.status = ${status}
    ORDER BY pp.created_at DESC
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
  `;

  return c.json({ promotions });
});

adminRoutes.put("/promotions/:id", async (c) => {
  const sql = getSql(c.env);
  const id = c.req.param("id");
  const body = await c.req.json();
  const status = z.enum(["approved", "rejected"]).parse(body.status);
  const admin_notes = z.string().max(2000).nullable().optional().parse(body.admin_notes);

  const result = await sql`
    UPDATE promotion_payments SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *
  `;

  if (result.length === 0) {
    throw new HTTPException(404, { message: "Promotion not found" });
  }

  // If approved, update ad featured status
  if (status === 'approved') {
    await sql`
      UPDATE ads SET featured = true, promotion_plan_name = (SELECT plan_name FROM promotion_payments WHERE id = ${id}), promotion_duration_months = (SELECT duration_months FROM promotion_payments WHERE id = ${id}), promotion_start_date = NOW(), promotion_end_date = NOW() + INTERVAL '1 month' * (SELECT duration_months FROM promotion_payments WHERE id = ${id}) WHERE id = (SELECT ad_id FROM promotion_payments WHERE id = ${id})
    `;
  }

  await auditLog(sql, c.get("user").id, "Promotion Processed", `Promotion ${id} ${status}`, "finance");

  return c.json({ promotion: result[0] });
});

// Password requests
adminRoutes.get("/passwords", async (c) => {
  const sql = getSql(c.env);
  const { status = "pending", limit = "50", offset = "0" } = c.req.query();

  const passwords = await sql`
    SELECT * FROM password_requests
    WHERE status = ${status}
    ORDER BY created_at DESC
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
  `;

  return c.json({ passwords });
});

adminRoutes.put("/passwords/:id", async (c) => {
  const sql = getSql(c.env);
  const id = c.req.param("id");
  const body = await c.req.json();
  const { status, admin_notes } = body;

  const result = await sql`
    UPDATE password_requests SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *
  `;

  if (result.length === 0) {
    throw new HTTPException(404, { message: "Password request not found" });
  }

  await auditLog(sql, c.get("user").id, "Password Request Processed", `Password request ${id} ${status}`, "security");

  return c.json({ password: result[0] });
});

// Audit logs
adminRoutes.get("/audit-logs", async (c) => {
  const sql = getSql(c.env);
  const { type, limit = "100", offset = "0" } = c.req.query();

  let whereClause = "WHERE 1=1";
  const params: any[] = [];
  let paramIndex = 1;

  if (type) {
    whereClause += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  const limitParam = paramIndex;
  const offsetParam = paramIndex + 1;
  const allParams = [...params, parseInt(limit), parseInt(offset)];

  const logs = await sql.unsafe(`
    SELECT al.*, p.full_name as user_name
    FROM audit_logs al
    LEFT JOIN profiles p ON al.user_id = p.id
    ${whereClause}
    ORDER BY al.created_at DESC
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `, allParams);

  return c.json({ logs });
});

// Intrusion logs
adminRoutes.get("/intrusion-logs", async (c) => {
  const sql = getSql(c.env);
  const { limit = "100", offset = "0" } = c.req.query();

  const logs = await sql`
    SELECT * FROM intrusion_logs
    ORDER BY created_at DESC
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
  `;

  return c.json({ logs });
});

// System config
adminRoutes.get("/system-config", async (c) => {
  const sql = getSql(c.env);
  const configs = await sql`SELECT * FROM system_configs ORDER BY key`;
  return c.json({ configs });
});

adminRoutes.put("/system-config", async (c) => {
  const sql = getSql(c.env);
  const body = await c.req.json();

  for (const [key, value] of Object.entries(body)) {
    const typedValue = value as boolean | number | string;
    await sql`
      INSERT INTO system_configs (key, value, description) VALUES (${key}, ${typedValue}, '')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
  }

  await auditLog(sql, c.get("user").id, "System Config Updated", `Updated config: ${Object.keys(body).join(", ")}`, "security");

  return c.json({ success: true });
});

adminRoutes.get("/adsense-config", async (c) => {
  const sql = getSql(c.env);
  const config = await loadAdSenseConfig(sql);
  return c.json({ success: true, config });
});

adminRoutes.put("/adsense-config", async (c) => {
  const sql = getSql(c.env);
  const body = await c.req.json().catch(() => ({}));
  const parsed = adsenseConfigSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: "Invalid AdSense settings payload",
      fields: parsed.error.flatten().fieldErrors,
    }, 400);
  }

  const config = await persistAdSenseConfig(sql, parsed.data);
  await auditLog(sql, c.get("user").id, "AdSense Config Updated", "Updated Google AdSense configuration", "security");

  return c.json({ success: true, config });
});

/**
 * Legacy site-settings endpoint.
 *
 * Kept for existing admin clients, but now routed through the shared metadata
 * store so branding, link previews and legacy identity fields are written
 * through a single validated code path.
 */
adminRoutes.put("/site-settings", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const current = await loadSiteMetadata(c.env);

  const pick = (...candidates: unknown[]) => {
    for (const candidate of candidates) {
      const value = cleanText(candidate);
      if (value) return value;
    }
    return undefined;
  };

  const patch: Partial<SiteMetadata> = {
    logoUrl: pick(body.logoUrl, body.logo_url),
    siteName: pick(body.siteName, body.site_name),
    siteDescription: pick(body.siteDescription, body.site_description),
    ogImage: pick(body.ogImage, body.og_image),
    contactEmail: pick(body.contactEmail, body.contact_email),
    contactPhone: pick(body.contactPhone, body.contact_phone),
  };

  const merged = mergeSiteMetadata(current, patch);
  const { metadata, storage } = await saveSiteMetadata(c.env, merged);

  await writeAuditLog(c.env, c, "Site Settings Updated", "Modified global site settings");

  return c.json({ success: true, storage, settings: metadata });
});

/* -------------------------------------------------------------------------- */
/* Site metadata & branding                                                    */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/admin/site-metadata
 *
 * Full editable record plus the derived values the admin UI needs to preview
 * link previews for every managed route.
 */
adminRoutes.get("/site-metadata", async (c) => {
  const metadata = await loadSiteMetadata(c.env);
  const origin = getSiteOrigin(c.env, c.req.url);

  return c.json({
    settings: metadata,
    origin,
    defaults: DEFAULT_SITE_METADATA,
    pages: EDITABLE_PAGE_DEFINITIONS.map((definition) => ({
      path: definition.path,
      label: definition.label,
      defaultTitle: definition.defaultTitle,
      defaultDescription: definition.defaultDescription,
      override: metadata.pageMetadata?.[definition.path] || {},
      resolved: resolveMetadata(metadata, { origin, path: definition.path }),
    })),
  });
});

/**
 * PUT /api/admin/site-metadata
 *
 * Validates the complete settings payload with zod, persists it, records an
 * audit entry and invalidates the edge cache so the change is visible on the
 * next request.
 */
adminRoutes.put("/site-metadata", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    throw new HTTPException(400, { message: "A settings payload is required" });
  }

  const parsed = siteMetadataUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.issues.reduce<Record<string, string>>((acc, issue) => {
      const key = issue.path.join(".") || "settings";
      if (!acc[key]) acc[key] = issue.message;
      return acc;
    }, {});

    // Returned directly (rather than thrown) so the field-level detail reaches
    // the admin form instead of being flattened by the global error handler.
    return c.json({ error: "Validation failed", fields }, 400);
  }

  const current = await loadSiteMetadata(c.env);
  const merged = mergeSiteMetadata(current, parsed.data as Partial<SiteMetadata>);

  try {
    const { metadata, storage } = await saveSiteMetadata(c.env, merged);
    await invalidateSiteMetadataCacheFor(c.env);

    const changed = describeChanges(current, metadata);

    await writeAuditLog(
      c.env,
      c,
      "Site Metadata Updated",
      changed.length > 0 ? `Changed: ${changed.join(", ")}` : "Saved without field changes",
    );

    const origin = getSiteOrigin(c.env, c.req.url);

    return c.json({
      success: true,
      storage,
      settings: metadata,
      changedFields: changed,
      resolved: resolveMetadata(metadata, { origin, path: "/" }),
    });
  } catch (error) {
    console.error("[admin] site metadata save failed:", error);
    throw new HTTPException(500, {
      message: "Site metadata could not be saved. The database may not have the latest migration applied.",
    });
  }
});

/** POST /api/admin/site-metadata/reset — restore compiled defaults. */
adminRoutes.post("/site-metadata/reset", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const scope = z.enum(["all", "branding", "seo"]).catch("all").parse(body?.scope ?? "all");

  const current = await loadSiteMetadata(c.env);
  const next: SiteMetadata = { ...current };

  if (scope === "all") {
    Object.assign(next, DEFAULT_SITE_METADATA, { pageMetadata: {} });
  } else if (scope === "branding") {
    next.logoUrl = DEFAULT_SITE_METADATA.logoUrl;
    next.faviconUrl = DEFAULT_SITE_METADATA.faviconUrl;
    next.appleTouchIconUrl = DEFAULT_SITE_METADATA.appleTouchIconUrl;
    next.themeColor = DEFAULT_SITE_METADATA.themeColor;
    next.manifestName = DEFAULT_SITE_METADATA.manifestName;
    next.manifestShortName = DEFAULT_SITE_METADATA.manifestShortName;
  } else {
    next.ogTitle = DEFAULT_SITE_METADATA.ogTitle;
    next.ogDescription = DEFAULT_SITE_METADATA.ogDescription;
    next.ogType = DEFAULT_SITE_METADATA.ogType;
    next.ogImage = DEFAULT_SITE_METADATA.ogImage;
    next.ogImageAlt = DEFAULT_SITE_METADATA.ogImageAlt;
    next.ogLocale = DEFAULT_SITE_METADATA.ogLocale;
    next.twitterCard = DEFAULT_SITE_METADATA.twitterCard;
    next.twitterSiteHandle = "";
    next.twitterCreatorHandle = "";
    next.twitterTitle = DEFAULT_SITE_METADATA.twitterTitle;
    next.twitterDescription = DEFAULT_SITE_METADATA.twitterDescription;
    next.twitterImage = DEFAULT_SITE_METADATA.twitterImage;
    next.pageTitleHome = DEFAULT_SITE_METADATA.pageTitleHome;
    next.metaDescriptionHome = DEFAULT_SITE_METADATA.metaDescriptionHome;
    next.canonicalUrl = "";
    next.robotsIndexing = true;
    next.pageMetadata = {};
  }

  const { metadata, storage } = await saveSiteMetadata(c.env, next);
  await invalidateSiteMetadataCacheFor(c.env);

  await writeAuditLog(c.env, c, "Site Metadata Reset", `Reset scope: ${scope}`);

  return c.json({ success: true, storage, settings: metadata, scope });
});

/**
 * GET /api/admin/site-metadata/preview?path=/faq&title=...
 *
 * Returns the exact `<head>` block the edge will serve for a route, so an
 * administrator can verify link previews without opening a crawler tool.
 */
adminRoutes.get("/site-metadata/preview", async (c) => {
  const metadata = await loadSiteMetadata(c.env);
  const origin = getSiteOrigin(c.env, c.req.url);

  const resolved = resolveMetadata(metadata, {
    origin,
    path: c.req.query("path") || "/",
    title: c.req.query("title") || undefined,
    description: c.req.query("description") || undefined,
    image: c.req.query("image") || undefined,
  });

  return c.json({ resolved, head: buildHeadHtml(resolved) });
});

/** Field-level diff for the audit trail. */
function describeChanges(before: SiteMetadata, after: SiteMetadata): string[] {
  const changed: string[] = [];

  for (const key of Object.keys(after) as (keyof SiteMetadata)[]) {
    if (key === "id" || key === "updatedAt") continue;

    const previous = JSON.stringify(before[key] ?? null);
    const next = JSON.stringify(after[key] ?? null);
    if (previous !== next) changed.push(key);
  }

  return changed;
}

/**
 * Audit helper that degrades gracefully when Hyperdrive is unavailable, so a
 * successful metadata write is never reported as a failure because the audit
 * connection could not be opened.
 */
async function writeAuditLog(env: any, c: any, action: string, details: string): Promise<void> {
  try {
    const sql = getSql(env);
    await auditLog(sql, c.get("user").id, action, details, "security");
  } catch (error) {
    console.error("[admin] audit log unavailable:", error);
  }
}

/* -------------------------------------------------------------------------- */
/* AI / Copilot configuration                                                  */
/* -------------------------------------------------------------------------- */

const normalizeAiConfigResponse = (env: any) => {
  const config = resolveAiConfig(env as Record<string, string | undefined>);
  const safeProvider = (config.provider || "sealify") as SupportedAIProvider;
  const status = config.enabled && (safeProvider === "sealify" || config.apiKey) ? "configured" : "disabled";

  return {
    provider: safeProvider,
    enabled: config.enabled !== false && (safeProvider === "sealify" || Boolean(config.apiKey)),
    model: config.model || (safeProvider === "openai" ? "gpt-4o-mini" : safeProvider === "gemini" ? "gemini-2.5-flash" : "sealify-mini"),
    webSearchEnabled: config.webSearchEnabled !== false,
    maxRequestLength: Number(config.maxRequestLength || 1600),
    perUserRateLimit: Number(config.perUserRateLimit || 10),
    dailyRequestLimit: Number(config.dailyRequestLimit || 500),
    maskedApiKey: maskSecret(config.apiKey),
    status,
    lastSuccessfulConnection: env.AI_LAST_SUCCESSFUL_CONNECTION || null,
    lastError: env.AI_LAST_ERROR || null,
  };
};

adminRoutes.get("/ai-settings", async (c) => {
  const env = c.env as any;
  return c.json(normalizeAiConfigResponse(env));
});

adminRoutes.put("/ai-settings", async (c) => {
  const env = c.env as any;
  const body = await c.req.json();
  const current = resolveAiConfig(env as Record<string, string | undefined>);
  const provider = (body.provider || current.provider || "sealify").toLowerCase();
  const safeProvider = provider === "openai" || provider === "gemini" || provider === "sealify" ? provider : "sealify";
  const nextModel = (body.model || current.model || (safeProvider === "openai" ? "gpt-4o-mini" : safeProvider === "gemini" ? "gemini-2.5-flash" : "sealify-mini")).trim();

  if (!isModelSupported(safeProvider, nextModel)) {
    throw new HTTPException(400, { message: "Unsupported AI model for the selected provider" });
  }

  const rawApiKey = body.apiKey === undefined ? current.apiKey || "" : String(body.apiKey).trim();
  const nextConfig = {
    provider: safeProvider,
    enabled: body.enabled ?? current.enabled ?? (safeProvider === "sealify" ? true : Boolean(rawApiKey)),
    model: nextModel,
    apiKey: rawApiKey,
    baseUrl: body.baseUrl || current.baseUrl || (safeProvider === "sealify" ? "http://localhost:11434" : undefined),
    webSearchEnabled: body.webSearchEnabled ?? current.webSearchEnabled ?? true,
    maxRequestLength: Number(body.maxRequestLength ?? current.maxRequestLength ?? 1600),
    perUserRateLimit: Number(body.perUserRateLimit ?? current.perUserRateLimit ?? 10),
    dailyRequestLimit: Number(body.dailyRequestLimit ?? current.dailyRequestLimit ?? 500),
  };

  setRuntimeAiConfig(nextConfig);

  return c.json({
    ...normalizeAiConfigResponse({ ...env, AI_PROVIDER: safeProvider, AI_WEB_SEARCH_ENABLED: String(nextConfig.webSearchEnabled), AI_MAX_REQUEST_LENGTH: String(nextConfig.maxRequestLength), AI_PER_USER_RATE_LIMIT: String(nextConfig.perUserRateLimit), AI_DAILY_LIMIT: String(nextConfig.dailyRequestLimit), ...(nextConfig.apiKey ? { [`${safeProvider.toUpperCase()}_API_KEY`]: nextConfig.apiKey } : {}) }),
    ...(nextConfig.apiKey ? { message: "AI configuration saved securely." } : { message: "AI configuration updated without a credential value." }),
  });
});

adminRoutes.post("/ai-settings/test", async (c) => {
  const env = c.env as any;
  const body = await c.req.json();
  const current = resolveAiConfig(env as Record<string, string | undefined>);
  const provider = ((body.provider || current.provider || "sealify") as SupportedAIProvider).toLowerCase();
  const safeProvider = provider === "openai" || provider === "gemini" || provider === "sealify" ? provider : "sealify";
  const model = (body.model || current.model || (safeProvider === "openai" ? "gpt-4o-mini" : safeProvider === "gemini" ? "gemini-2.5-flash" : "sealify-mini")).trim();
  const apiKey = body.apiKey === undefined ? (current.apiKey || "") : String(body.apiKey).trim();
  const baseUrl = body.baseUrl || current.baseUrl || "http://localhost:11434";

  if (safeProvider !== "sealify" && !apiKey) {
    throw new HTTPException(400, { message: "AI provider credential is required for a connection test." });
  }

  if (!isModelSupported(safeProvider, model)) {
    throw new HTTPException(400, { message: "Unsupported AI model for the selected provider." });
  }

  try {
    if (safeProvider === "sealify") {
      const url = String(baseUrl).replace(/\/$/, "") + "/api/chat";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: [{ role: "user", content: "Connection test for Sealify Copilot." }], stream: false }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: { message: "Sealify model endpoint is unreachable." } }));
        throw new HTTPException(res.status as any, { message: payload?.error?.message || "Sealify model endpoint is unreachable." });
      }
    } else if (safeProvider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        throw new HTTPException(res.status as any, { message: "OpenAI credentials are invalid or expired." });
      }
    } else {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Connection test for Sealify Copilot." }] }] }),
      });
      if (!res.ok) {
        throw new HTTPException(res.status as any, { message: "Gemini credentials are invalid or expired." });
      }
    }

    const successAt = new Date().toISOString();
    return c.json({
      success: true,
      message: `Connection test successful for ${safeProvider}.`,
      provider: safeProvider,
      model,
      lastSuccessfulConnection: successAt,
    });
  } catch (error: any) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Connection test failed: the provider could not be reached." });
  }
});

adminRoutes.get("/site-settings", async (c) => {
  const settings = await loadSiteMetadata(c.env);
  return c.json({ settings });
});

// Broadcast
adminRoutes.post("/broadcast", async (c) => {
  const sql = getSql(c.env);
  const body = await c.req.json();
  const { target, title, message } = body;

  if (!target || !title || !message) {
    throw new HTTPException(400, { message: "Target, title, and message required" });
  }

  let whereClause = "";
  if (target === "buyer") whereClause = "WHERE role = 'buyer'";
  else if (target === "seller") whereClause = "WHERE role = 'seller'";
   else if (target !== "all") throw new HTTPException(400, { message: "Invalid target" });

  const users = await sql.unsafe(`
    SELECT id FROM profiles ${whereClause}
  `);

  // Batch insert notifications
  for (const user of users) {
    await sql`
      INSERT INTO notifications (user_id, type, title, description, created_at)
      VALUES (${user.id}, 'system', ${title}, ${message}, NOW())
    `;
  }

  await auditLog(sql, c.get("user").id, "Broadcast Sent", `Sent to ${target}: ${title}`, "broadcast");

  return c.json({ success: true, sent: users.length });
});

adminRoutes.post("/email-digest", async (c) => {
  const sql = getSql(c.env);
  const body = await c.req.json().catch(() => ({}));
  const audience = body.audience || "all";

  if (!['all', 'buyers', 'sellers'].includes(audience)) {
    throw new HTTPException(400, { message: "Audience must be all, buyers, or sellers" });
  }

  let whereClause = "";
  if (audience === "buyers") whereClause = "WHERE role = 'buyer'";
  else if (audience === "sellers") whereClause = "WHERE role = 'seller'";

  const users = await sql.unsafe(`
    SELECT id, full_name FROM profiles ${whereClause}
  `);

  const digestTitle = "Sealify Weekly Digest";
  const digestMessage = "Fresh marketplace updates, verified opportunities, and platform news are now available on Sealify.";

  for (const user of users) {
    await sql`
      INSERT INTO notifications (user_id, type, title, description, created_at)
      VALUES (${user.id}, 'system', ${digestTitle}, ${digestMessage}, NOW())
    `;
  }

  await auditLog(sql, c.get("user").id, "Email Digest Sent", `Queued digest for ${audience}: ${users.length} recipients`, "broadcast");

  return c.json({
    success: true,
    audience,
    sent: users.length,
    message: `Weekly digest queued for ${users.length} recipients.`,
  });
});

// Database backup
adminRoutes.get("/backup", async (c) => {
  const sql = getSql(c.env);

  const [users, listings, configs, settings] = await Promise.all([
    sql`SELECT * FROM profiles`,
    sql`SELECT * FROM ads`,
    sql`SELECT * FROM system_configs`,
    sql`SELECT * FROM site_settings`,
  ]);

  const backup = {
    timestamp: new Date().toISOString(),
    version: "1.0",
    data: { users, listings, configs, settings },
  };

  c.header("Content-Type", "application/json");
  c.header("Content-Disposition", `attachment; filename="sealify-backup-${new Date().toISOString().split('T')[0]}.json"`);

  return c.json(backup);
});

// SQL Schema export
adminRoutes.get("/schema", async (c) => {
  const sql = getSql(c.env);

  // Get schema from information_schema
  const tables = await sql`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `;

  let schema = "-- Sealify Database Schema Export\n";
  schema += `-- Generated: ${new Date().toISOString()}\n\n`;

  const tableGroups = tables.reduce((acc: any, row: any) => {
    if (!acc[row.table_name]) acc[row.table_name] = [];
    acc[row.table_name].push(row);
    return acc;
  }, {});

  for (const [tableName, columns] of Object.entries(tableGroups)) {
    schema += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    const colDefs = (columns as any[]).map((col: any) => {
      let def = `  ${col.column_name} ${col.data_type}`;
      if (col.is_nullable === 'NO') def += ' NOT NULL';
      if (col.column_default) def += ` DEFAULT ${col.column_default}`;
      return def;
    });
    schema += colDefs.join(",\n") + "\n);\n\n";
  }

  c.header("Content-Type", "text/sql");
  c.header("Content-Disposition", `attachment; filename="sealify-schema-${new Date().toISOString().split('T')[0]}.sql"`);

  return c.text(schema);
});

export default adminRoutes;
