import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, requireAuth, auditLog, logIntrusionAttempt, rateLimit } from "../middleware/security";

export const adminRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql>; user: any; supabase: any; profile: any } }>();

// Apply rate limiting to all admin routes
adminRoutes.use("/*", rateLimit({ windowMs: 60000, maxRequests: 100 })); // 100 req/min
adminRoutes.use("/*", requireAdmin);

// Admin login with intrusion logging
adminRoutes.post("/login", async (c) => {
  const env = c.env as any;
  const body = await c.req.json();
  const { email, password, pin } = body;

  if (!email || !password || !pin) {
    throw new HTTPException(400, { message: "Email, password, and PIN required" });
  }

  const sql = getSql(env);
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);

  // Check against environment variables (set in Cloudflare Dashboard)
  const adminEmail = env.ADMIN_EMAIL;
  const adminPassword = env.ADMIN_PASSWORD;
  const adminPin = env.ADMIN_PIN;

  if (!adminEmail || !adminPassword || !adminPin) {
    throw new HTTPException(500, { message: "Admin credentials not configured" });
  }

  // Log intrusion attempt for any failed login
  const isValid = email === adminEmail && password === adminPassword && pin === adminPin;

  if (!isValid) {
    await logIntrusionAttempt(getSql(env), email, c.req.raw, {
      reason: "invalid_credentials",
      providedEmail: email,
    });
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  // Verify user exists in profiles with admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", adminEmail)
    .eq("role", "admin")
    .single();

  if (!profile) {
    await logIntrusionAttempt(getSql(env), email, c.req.raw, {
      reason: "no_admin_profile",
    });
    throw new HTTPException(403, { message: "Admin profile not found" });
  }

  // Create session token (in production, use proper JWT)
  const sessionToken = btoa(JSON.stringify({
    sub: profile.id,
    email: profile.email,
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  }));

  await auditLog(getSql(env), profile.id, "Admin Login", "Successful admin terminal access", "security");

  return c.json({
    success: true,
    token: sessionToken,
    user: {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      verified: profile.verified,
    },
  });
});

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
    whereClause += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (role) {
    whereClause += ` AND role = $${paramIndex}`;
    params.push(role);
    paramIndex++;
  }

  if (status) {
    whereClause += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (verified !== undefined) {
    whereClause += ` AND verified = $${paramIndex}`;
    params.push(verified === "true");
    paramIndex++;
  }

  const limitNum = Math.min(parseInt(limit) || 50, 200);
  const offsetNum = parseInt(offset) || 0;

  const users = await sql`
    SELECT * FROM profiles
    ${sql(whereClause)}
    ORDER BY created_at DESC
    LIMIT ${limitNum} OFFSET ${offsetNum}
  `;

  const countResult = await sql`
    SELECT COUNT(*) as total FROM profiles ${sql(whereClause)}
  `;

  return c.json({
    users,
    total: parseInt(countResult[0]?.total || "0"),
    limit: limitNum,
    offset: offsetNum
  });
});

adminRoutes.put("/users/:id", async (c) => {
  const sql = getSql(c.env);
  const id = c.req.param("id");
  const body = await c.req.json();

  const allowedFields = [
    'full_name', 'phone_number', 'avatar_url', 'store_banner_url',
    'bio', 'location', 'business_name', 'cac_number', 'business_hours',
    'bank_name', 'account_number', 'account_name',
    'website_url', 'instagram_handle', 'twitter_handle', 'whatsapp_number',
    'email_notifications', 'whatsapp_notifications', 'hide_phone_publicly', 'hide_location_publicly',
    'role', 'status', 'verified', 'verification_type', 'restriction_reason', 'appeal_status'
  ];

  const updates: any = { updated_at: new Date() };
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const result = await sql`
    UPDATE profiles SET ${sql(updates)} WHERE id = ${id} RETURNING *
  `;

  if (result.length === 0) {
    throw new HTTPException(404, { message: "User not found" });
  }

  await auditLog(sql, c.get("user").id, "User Updated", `Updated user ${id}`, "user");

  return c.json({ user: result[0] });
});

adminRoutes.delete("/users/:id", async (c) => {
  const sql = getSql(c.env);
  const id = c.req.param("id");

  // Prevent self-deletion
  if (c.get("user").id === id) {
    throw new HTTPException(400, { message: "Cannot delete your own account" });
  }

  await sql`DELETE FROM profiles WHERE id = ${id}`;
  await auditLog(sql, c.get("user").id, "User Deleted", `Deleted user ${id}`, "user");

  return c.json({ success: true });
});

adminRoutes.post("/users/bulk", async (c) => {
  const sql = getSql(c.env);
  const body = await c.req.json();
  const { ids, action, data } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new HTTPException(400, { error: "No user IDs provided" });
  }

  const updates: any = { updated_at: new Date() };
  if (data) {
    Object.assign(updates, data);
  }

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const query = `UPDATE profiles SET ${Object.entries(updates).map(([k, v], i) => `${k} = $${ids.length + i + 1}`).join(', ')}, updated_at = NOW() WHERE id IN (${placeholders})`;
  const values = [...ids, ...Object.values(updates)];

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
  const { status, admin_notes } = body;

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
  const { status, admin_notes } = body;

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
  const { status, admin_notes } = body;

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
  const { status, admin_notes } = body;

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

  const logs = await sql`
    SELECT al.*, p.full_name as user_name
    FROM audit_logs al
    LEFT JOIN profiles p ON al.user_id = p.id
    ${sql(whereClause)}
    ORDER BY al.created_at DESC
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
  `;

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

  await auditLog(sql, c.get("user").id, "System Config Updated", `Updated config: ${Object.keys(body).join(", ")}`, "system");

  return c.json({ success: true });
});

// Site settings
adminRoutes.get("/site-settings", async (c) => {
  const sql = getSql(c.env);
  const settings = await sql`SELECT * FROM site_settings LIMIT 1`;
  return c.json({ settings: settings[0] || null });
});

adminRoutes.put("/site-settings", async (c) => {
  const sql = getSql(c.env);
  const body = await c.req.json();

  await sql`
    INSERT INTO site_settings (site_name, site_description, og_image, contact_email, contact_phone, updated_at)
    VALUES (${body.siteName}, ${body.siteDescription}, ${body.ogImage}, ${body.contactEmail}, ${body.contactPhone}, NOW())
    ON CONFLICT DO UPDATE SET
      site_name = EXCLUDED.site_name,
      site_description = EXCLUDED.site_description,
      og_image = EXCLUDED.og_image,
      contact_email = EXCLUDED.contact_email,
      contact_phone = EXCLUDED.contact_phone,
      updated_at = NOW()
  `;

  await auditLog(sql, c.get("user").id, "Site Settings Updated", "Modified global site settings", "system");

  return c.json({ success: true });
});

// Broadcast
adminRoutes.post("/broadcast", async (c) => {
  const sql = getSql(c.env);
  const body = await c.req.json();
  const { target, title, message } = body;

  if (!target || !title || !message) {
    throw new HTTPException(400, { error: "Target, title, and message required" });
  }

  let whereClause = "";
  if (target === "buyer") whereClause = "WHERE role = 'buyer'";
  else if (target === "seller") whereClause = "WHERE role = 'seller'";
  else if (target !== "all") throw new HTTPException(400, { error: "Invalid target" });

  const users = await sql`
    SELECT id FROM profiles ${sql(whereClause)}
  `;

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

// Database backup
adminRoutes.get("/backup", async (c) => {
  const sql = getSql(c.env);

  const [users, listings, transactions, wallets, configs, settings] = await Promise.all([
    sql`SELECT * FROM profiles`,
    sql`SELECT * FROM ads`,
    sql`SELECT * FROM transactions`,
    sql`SELECT * FROM wallets`,
    sql`SELECT * FROM system_configs`,
    sql`SELECT * FROM site_settings`,
  ]);

  const backup = {
    timestamp: new Date().toISOString(),
    version: "1.0",
    data: { users, listings, transactions, wallets, configs, settings },
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
    const colDefs = columns.map((col: any) => {
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