import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const adminRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql> } }>();

// Middleware to check admin
async function requireAdmin(c: any, next: any) {
  const env = c.env as any;
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return c.json({ error: "Invalid token" }, 401);
  }

  const sql = getSql(env);
  const profile = await sql`SELECT role FROM users WHERE id = ${user.id}`;
  
  if (profile.length === 0 || profile[0].role !== 'admin') {
    return c.json({ error: "Forbidden: Admin access required" }, 403);
  }

  c.set("sql", sql);
  await next();
}

adminRoutes.use("/*", requireAdmin);

// Dashboard stats
adminRoutes.get("/stats", async (c) => {
  try {
    const sql = c.get("sql");
    
    const [
      totalUsers,
      totalListings,
      activeListings,
      soldListings,
      pendingVerifications,
      pendingPromotions,
      openDisputes,
      totalRevenue
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM listings`,
      sql`SELECT COUNT(*) as count FROM listings WHERE status = 'active'`,
      sql`SELECT COUNT(*) as count FROM listings WHERE status = 'sold'`,
      sql`SELECT COUNT(*) as count FROM verification_requests WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM promotion_payments WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM disputes WHERE status IN ('pending', 'in_review')`,
      sql`SELECT COALESCE(SUM(amount), 0) as total FROM promotion_payments WHERE status = 'approved'`
    ]);

    return c.json({
      totalUsers: parseInt(totalUsers[0]?.count || "0"),
      totalListings: parseInt(totalListings[0]?.count || "0"),
      activeListings: parseInt(activeListings[0]?.count || "0"),
      soldListings: parseInt(soldListings[0]?.count || "0"),
      pendingVerifications: parseInt(pendingVerifications[0]?.count || "0"),
      pendingPromotions: parseInt(pendingPromotions[0]?.count || "0"),
      openDisputes: parseInt(openDisputes[0]?.count || "0"),
      totalRevenue: parseFloat(totalRevenue[0]?.total || "0")
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

// Verification requests
adminRoutes.get("/verifications", async (c) => {
  try {
    const sql = c.get("sql");
    const { status, limit = "50", offset = "0" } = c.req.query();

    let whereClause = "WHERE 1=1";
    if (status) {
      whereClause += ` AND status = '${status}'`;
    }

    const requests = await sql`
      SELECT vr.*, u.full_name, u.email, u.avatar_url
      FROM verification_requests vr
      LEFT JOIN users u ON vr.user_id = u.id
      ${sql(whereClause)}
      ORDER BY vr.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    return c.json({ requests });
  } catch (error) {
    console.error("Get verifications error:", error);
    return c.json({ error: "Failed to fetch verifications" }, 500);
  }
});

adminRoutes.put("/verifications/:id", async (c) => {
  try {
    const sql = c.get("sql");
    const id = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    const result = await sql`
      UPDATE verification_requests SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Verification request not found" }, 404);
    }

    // If approved, update user verification status
    if (status === 'approved') {
      await sql`
        UPDATE users SET verified = true, verification_type = ${result[0].type}, updated_at = NOW()
        WHERE id = ${result[0].user_id}
      `;
    }

    return c.json({ request: result[0] });
  } catch (error) {
    console.error("Update verification error:", error);
    return c.json({ error: "Failed to update verification" }, 500);
  }
});

// Promotion payments
adminRoutes.get("/promotions", async (c) => {
  try {
    const sql = c.get("sql");
    const { status, limit = "50", offset = "0" } = c.req.query();

    let whereClause = "WHERE 1=1";
    if (status) {
      whereClause += ` AND status = '${status}'`;
    }

    const payments = await sql`
      SELECT pp.*, u.full_name, u.email, l.title as listing_title
      FROM promotion_payments pp
      LEFT JOIN users u ON pp.user_id = u.id
      LEFT JOIN listings l ON pp.listing_id = l.id
      ${sql(whereClause)}
      ORDER BY pp.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    return c.json({ payments });
  } catch (error) {
    console.error("Get promotions error:", error);
    return c.json({ error: "Failed to fetch promotions" }, 500);
  }
});

adminRoutes.put("/promotions/:id", async (c) => {
  try {
    const sql = c.get("sql");
    const id = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    const result = await sql`
      UPDATE promotion_payments SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Promotion payment not found" }, 404);
    }

    // If approved, activate featured listing
    if (status === 'approved') {
      await sql`
        UPDATE listings SET featured = true, promotion_plan_name = ${result[0].plan_name}, 
        promotion_duration_months = ${result[0].duration_months}, updated_at = NOW()
        WHERE id = ${result[0].listing_id}
      `;
    }

    return c.json({ payment: result[0] });
  } catch (error) {
    console.error("Update promotion error:", error);
    return c.json({ error: "Failed to update promotion" }, 500);
  }
});

// Disputes
adminRoutes.get("/disputes", async (c) => {
  try {
    const sql = c.get("sql");
    const { status, limit = "50", offset = "0" } = c.req.query();

    let whereClause = "WHERE 1=1";
    if (status) {
      whereClause += ` AND status = '${status}'`;
    }

    const disputes = await sql`
      SELECT d.*, u.full_name as reporter_name, u.email as reporter_email
      FROM disputes d
      LEFT JOIN users u ON d.user_id = u.id
      ${sql(whereClause)}
      ORDER BY d.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    return c.json({ disputes });
  } catch (error) {
    console.error("Get disputes error:", error);
    return c.json({ error: "Failed to fetch disputes" }, 500);
  }
});

adminRoutes.put("/disputes/:id", async (c) => {
  try {
    const sql = c.get("sql");
    const id = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    if (!['pending', 'in_review', 'resolved'].includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    const result = await sql`
      UPDATE disputes SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Dispute not found" }, 404);
    }

    return c.json({ dispute: result[0] });
  } catch (error) {
    console.error("Update dispute error:", error);
    return c.json({ error: "Failed to update dispute" }, 500);
  }
});

// Reports
adminRoutes.get("/reports", async (c) => {
  try {
    const sql = c.get("sql");
    const { status, limit = "50", offset = "0" } = c.req.query();

    let whereClause = "WHERE 1=1";
    if (status) {
      whereClause += ` AND status = '${status}'`;
    }

    const reports = await sql`
      SELECT r.*, u.full_name as reporter_name, u.email as reporter_email, l.title as listing_title
      FROM reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      LEFT JOIN listings l ON r.listing_id = l.id
      ${sql(whereClause)}
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    return c.json({ reports });
  } catch (error) {
    console.error("Get reports error:", error);
    return c.json({ error: "Failed to fetch reports" }, 500);
  }
});

adminRoutes.put("/reports/:id", async (c) => {
  try {
    const sql = c.get("sql");
    const id = c.req.param("id");
    const body = await c.req.json();
    const { action } = body; // 'dismiss' or 'resolve_delete_ad'

    if (!['dismiss', 'resolve_delete_ad'].includes(action)) {
      return c.json({ error: "Invalid action" }, 400);
    }

    const report = await sql`SELECT * FROM reports WHERE id = ${id}`;
    if (report.length === 0) {
      return c.json({ error: "Report not found" }, 404);
    }

    if (action === 'resolve_delete_ad') {
      await sql`DELETE FROM listings WHERE id = ${report[0].listing_id}`;
      await sql`UPDATE reports SET status = 'resolved', updated_at = NOW() WHERE id = ${id}`;
    } else {
      await sql`UPDATE reports SET status = 'dismissed', updated_at = NOW() WHERE id = ${id}`;
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Process report error:", error);
    return c.json({ error: "Failed to process report" }, 500);
  }
});

// System config
adminRoutes.get("/config", async (c) => {
  try {
    const sql = c.get("sql");
    const configs = await sql`SELECT * FROM system_configs`;
    return c.json({ configs });
  } catch (error) {
    console.error("Get config error:", error);
    return c.json({ error: "Failed to fetch config" }, 500);
  }
});

adminRoutes.put("/config/:key", async (c) => {
  try {
    const sql = c.get("sql");
    const key = c.req.param("key");
    const body = await c.req.json();
    const { value } = body;

    await sql`
      INSERT INTO system_configs (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
    `;

    return c.json({ success: true });
  } catch (error) {
    console.error("Update config error:", error);
    return c.json({ error: "Failed to update config" }, 500);
  }
});

// Site settings
adminRoutes.get("/settings", async (c) => {
  try {
    const sql = c.get("sql");
    const settings = await sql`SELECT * FROM site_settings LIMIT 1`;
    return c.json({ settings: settings[0] || null });
  } catch (error) {
    console.error("Get settings error:", error);
    return c.json({ error: "Failed to fetch settings" }, 500);
  }
});

adminRoutes.put("/settings", async (c) => {
  try {
    const sql = c.get("sql");
    const body = await c.req.json();
    
    const allowedFields = [
      'logo_url', 'site_name', 'site_description', 'og_image',
      'contact_email', 'contact_phone'
    ];

    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const keys = Object.keys(updates);
    const values = Object.values(updates);
    
    await sql`
      INSERT INTO site_settings (${sql(keys)}, updated_at)
      VALUES (${sql(values)}, NOW())
      ON CONFLICT (id) DO UPDATE SET ${sql(updates)}, updated_at = NOW()
    `;

    return c.json({ success: true });
  } catch (error) {
    console.error("Update settings error:", error);
    return c.json({ error: "Failed to update settings" }, 500);
  }
});

// Announcements
adminRoutes.get("/announcements", async (c) => {
  try {
    const sql = c.get("sql");
    const announcements = await sql`
      SELECT * FROM announcements ORDER BY created_at DESC
    `;
    return c.json({ announcements });
  } catch (error) {
    console.error("Get announcements error:", error);
    return c.json({ error: "Failed to fetch announcements" }, 500);
  }
});

adminRoutes.post("/announcements", async (c) => {
  try {
    const sql = c.get("sql");
    const body = await c.req.json();
    const { title, message, type, active = true } = body;

    if (!title || !message) {
      return c.json({ error: "Title and message are required" }, 400);
    }

    const result = await sql`
      INSERT INTO announcements (title, message, type, active, created_at)
      VALUES (${title}, ${message}, ${type || 'info'}, ${active}, NOW())
      RETURNING *
    `;

    return c.json({ announcement: result[0] }, 201);
  } catch (error) {
    console.error("Create announcement error:", error);
    return c.json({ error: "Failed to create announcement" }, 500);
  }
});

adminRoutes.put("/announcements/:id", async (c) => {
  try {
    const sql = c.get("sql");
    const id = c.req.param("id");
    const body = await c.req.json();

    const allowedFields = ['title', 'message', 'type', 'active'];
    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const result = await sql`
      UPDATE announcements SET ${sql(updates)} WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Announcement not found" }, 404);
    }

    return c.json({ announcement: result[0] });
  } catch (error) {
    console.error("Update announcement error:", error);
    return c.json({ error: "Failed to update announcement" }, 500);
  }
});

adminRoutes.delete("/announcements/:id", async (c) => {
  try {
    const sql = c.get("sql");
    const id = c.req.param("id");
    await sql`DELETE FROM announcements WHERE id = ${id}`;
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return c.json({ error: "Failed to delete announcement" }, 500);
  }
});

// Safe spots
adminRoutes.get("/safespots", async (c) => {
  try {
    const sql = c.get("sql");
    const spots = await sql`SELECT * FROM safe_spots ORDER BY zone, name`;
    return c.json({ spots });
  } catch (error) {
    console.error("Get safespots error:", error);
    return c.json({ error: "Failed to fetch safe spots" }, 500);
  }
});

adminRoutes.post("/safespots", async (c) => {
  try {
    const sql = c.get("sql");
    const body = await c.req.json();
    const { name, zone, category, address, distance, hours, cctvVerified } = body;

    if (!name || !zone || !category || !address) {
      return c.json({ error: "Name, zone, category, and address are required" }, 400);
    }

    const result = await sql`
      INSERT INTO safe_spots (name, zone, category, address, distance, hours, cctv_verified, created_at)
      VALUES (${name}, ${zone}, ${category}, ${address}, ${distance || 'Central Hub'}, ${hours || '8:00 AM - 6:00 PM'}, ${cctvVerified || true}, NOW())
      RETURNING *
    `;

    return c.json({ spot: result[0] }, 201);
  } catch (error) {
    console.error("Create safespot error:", error);
    return c.json({ error: "Failed to create safe spot" }, 500);
  }
});

adminRoutes.delete("/safespots/:id", async (c) => {
  try {
    const sql = c.get("sql");
    const id = c.req.param("id");
    await sql`DELETE FROM safe_spots WHERE id = ${id}`;
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete safespot error:", error);
    return c.json({ error: "Failed to delete safe spot" }, 500);
  }
});

// Audit logs
adminRoutes.get("/audit-logs", async (c) => {
  try {
    const sql = c.get("sql");
    const { type, limit = "100", offset = "0" } = c.req.query();

    let whereClause = "WHERE 1=1";
    if (type) {
      whereClause += ` AND type = '${type}'`;
    }

    const logs = await sql`
      SELECT * FROM audit_logs
      ${sql(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    return c.json({ logs });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return c.json({ error: "Failed to fetch audit logs" }, 500);
  }
});

// Intrusion logs
adminRoutes.get("/intrusion-logs", async (c) => {
  try {
    const sql = c.get("sql");
    const { limit = "100", offset = "0" } = c.req.query();

    const logs = await sql`
      SELECT * FROM intrusion_logs
      ORDER BY timestamp DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    return c.json({ logs });
  } catch (error) {
    console.error("Get intrusion logs error:", error);
    return c.json({ error: "Failed to fetch intrusion logs" }, 500);
  }
});

// Broadcast notification
adminRoutes.post("/broadcast", async (c) => {
  try {
    const sql = c.get("sql");
    const body = await c.req.json();
    const { title, message, targetRole } = body;

    if (!title || !message) {
      return c.json({ error: "Title and message are required" }, 400);
    }

    let whereClause = "WHERE 1=1";
    if (targetRole && targetRole !== 'all') {
      whereClause += ` AND role = '${targetRole}'`;
    }

    const users = await sql`
      SELECT id FROM users ${sql(whereClause)}
    `;

    const notifications = users.map(u => ({
      user_id: u.id,
      type: 'system',
      title,
      description: message,
      read: false,
      created_at: new Date()
    }));

    if (notifications.length > 0) {
      await sql`
        INSERT INTO notifications (user_id, type, title, description, read, created_at)
        SELECT user_id, type, title, description, read, created_at
        FROM ${sql(notifications)}
      `;
    }

    return c.json({ sent: notifications.length });
  } catch (error) {
    console.error("Broadcast error:", error);
    return c.json({ error: "Failed to send broadcast" }, 500);
  }
});