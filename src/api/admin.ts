import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const adminRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql> } }>();

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
  const profile = await sql`SELECT role FROM profiles WHERE id = ${user.id}`;
  
  if (profile.length === 0 || profile[0].role !== 'admin') {
    return c.json({ error: "Forbidden: Admin access required" }, 403);
  }

  c.set("sql", sql);
  await next();
}

adminRoutes.use("/*", requireAdmin);

adminRoutes.get("/stats", async (c) => {
  try {
    const sql = c.get("sql");
    
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
      }
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

adminRoutes.get("/users", async (c) => {
  try {
    const sql = c.get("sql");
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
  } catch (error) {
    console.error("Get users error:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

adminRoutes.put("/users/:id", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const allowedFields = [
      'full_name', 'phone_number', 'avatar_url', 'cover_url',
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
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user: result[0] });
  } catch (error) {
    console.error("Update user error:", error);
    return c.json({ error: "Failed to update user" }, 500);
  }
});

adminRoutes.delete("/users/:id", async (c) => {
  try {
    const sql = c.get("sql");
    const id = c.req.param("id");
    
    await sql`DELETE FROM profiles WHERE id = ${id}`;

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

adminRoutes.post("/users/bulk", async (c) => {
  try {
    const sql = c.get("sql");
    const body = await c.req.json();
    const { ids, action, data } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: "No user IDs provided" }, 400);
    }

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const query = `UPDATE profiles SET ${Object.entries(data).map(([k, v], i) => `${k} = $${ids.length + i + 1}`).join(', ')}, updated_at = NOW() WHERE id IN (${placeholders})`;
    const values = [...ids, ...Object.values(data)];

    await sql.unsafe(query, values);

    return c.json({ success: true, updated: ids.length });
  } catch (error) {
    console.error("Bulk update users error:", error);
    return c.json({ error: "Failed to bulk update users" }, 500);
  }
});

adminRoutes.get("/listings", async (c) => {
  try {
    const sql = c.get("sql");
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
  } catch (error) {
    console.error("Get admin listings error:", error);
    return c.json({ error: "Failed to fetch listings" }, 500);
  }
});

adminRoutes.get("/reports", async (c) => {
  try {
    const sql = c.get("sql");
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
    const { status, admin_notes } = body;

    const result = await sql`
      UPDATE reports SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Report not found" }, 404);
    }

    return c.json({ report: result[0] });
  } catch (error) {
    console.error("Update report error:", error);
    return c.json({ error: "Failed to update report" }, 500);
  }
});

adminRoutes.get("/disputes", async (c) => {
  try {
    const sql = c.get("sql");
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
    const { status, admin_notes } = body;

    const result = await sql`
      UPDATE disputes SET status = ${status}, admin_notes = ${admin_notes || null}, ${status === 'resolved' ? 'resolved_at = NOW()' : ''} WHERE id = ${id} RETURNING *
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

adminRoutes.get("/verifications", async (c) => {
  try {
    const sql = c.get("sql");
    const { status = "pending", limit = "50", offset = "0" } = c.req.query();

    const verifications = await sql`
      SELECT * FROM verification_requests
      WHERE status = ${status}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    return c.json({ verifications });
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
    const { status, admin_notes } = body;

    const result = await sql`
      UPDATE verification_requests SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Verification not found" }, 404);
    }

    // If approved, update user profile
    if (status === 'approved') {
      await sql`
        UPDATE profiles SET verified = true, verification_type = (SELECT type FROM verification_requests WHERE id = ${id}) WHERE id = (SELECT user_id FROM verification_requests WHERE id = ${id})
      `;
    }

    return c.json({ verification: result[0] });
  } catch (error) {
    console.error("Update verification error:", error);
    return c.json({ error: "Failed to update verification" }, 500);
  }
});

adminRoutes.get("/promotions", async (c) => {
  try {
    const sql = c.get("sql");
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
    const { status, admin_notes } = body;

    const result = await sql`
      UPDATE promotion_payments SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Promotion not found" }, 404);
    }

    // If approved, update ad featured status
    if (status === 'approved') {
      await sql`
        UPDATE ads SET featured = true, promotion_plan_name = (SELECT plan_name FROM promotion_payments WHERE id = ${id}), promotion_duration_months = (SELECT duration_months FROM promotion_payments WHERE id = ${id}), promotion_start_date = NOW(), promotion_end_date = NOW() + INTERVAL '1 month' * (SELECT duration_months FROM promotion_payments WHERE id = ${id}) WHERE id = (SELECT ad_id FROM promotion_payments WHERE id = ${id})
      `;
    }

    return c.json({ promotion: result[0] });
  } catch (error) {
    console.error("Update promotion error:", error);
    return c.json({ error: "Failed to update promotion" }, 500);
  }
});

adminRoutes.get("/passwords", async (c) => {
  try {
    const sql = c.get("sql");
    const { status = "pending", limit = "50", offset = "0" } = c.req.query();

    const passwords = await sql`
      SELECT * FROM password_requests
      WHERE status = ${status}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    return c.json({ passwords });
  } catch (error) {
    console.error("Get passwords error:", error);
    return c.json({ error: "Failed to fetch password requests" }, 500);
  }
});

adminRoutes.put("/passwords/:id", async (c) => {
  try {
    const sql = c.get("sql");
    const id = c.req.param("id");
    const body = await c.req.json();
    const { status, admin_notes } = body;

    const result = await sql`
      UPDATE password_requests SET status = ${status}, admin_notes = ${admin_notes || null}, reviewed_at = NOW() WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Password request not found" }, 404);
    }

    return c.json({ password: result[0] });
  } catch (error) {
    console.error("Update password error:", error);
    return c.json({ error: "Failed to update password request" }, 500);
  }
});

adminRoutes.get("/audit-logs", async (c) => {
  try {
    const sql = c.get("sql");
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
  } catch (error) {
    console.error("Get audit logs error:", error);
    return c.json({ error: "Failed to fetch audit logs" }, 500);
  }
});

adminRoutes.get("/intrusion-logs", async (c) => {
  try {
    const sql = c.get("sql");
    const { limit = "100", offset = "0" } = c.req.query();

    const logs = await sql`
      SELECT * FROM intrusion_logs
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    return c.json({ logs });
  } catch (error) {
    console.error("Get intrusion logs error:", error);
    return c.json({ error: "Failed to fetch intrusion logs" }, 500);
  }
});

adminRoutes.get("/system-config", async (c) => {
  try {
    const sql = c.get("sql");
    const configs = await sql`SELECT * FROM system_configs ORDER BY key`;
    return c.json({ configs });
  } catch (error) {
    console.error("Get system config error:", error);
    return c.json({ error: "Failed to fetch system config" }, 500);
  }
});

adminRoutes.put("/system-config", async (c) => {
  try {
    const sql = c.get("sql");
    const body = await c.req.json();
    
    for (const [key, value] of Object.entries(body)) {
      await sql`
        INSERT INTO system_configs (key, value, description) VALUES (${key}, ${value}, '')
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Update system config error:", error);
    return c.json({ error: "Failed to update system config" }, 500);
  }
});

adminRoutes.get("/site-settings", async (c) => {
  try {
    const sql = c.get("sql");
    const settings = await sql`SELECT * FROM site_settings LIMIT 1`;
    return c.json({ settings: settings[0] || null });
  } catch (error) {
    console.error("Get site settings error:", error);
    return c.json({ error: "Failed to fetch site settings" }, 500);
  }
});

adminRoutes.put("/site-settings", async (c) => {
  try {
    const sql = c.get("sql");
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

    return c.json({ success: true });
  } catch (error) {
    console.error("Update site settings error:", error);
    return c.json({ error: "Failed to update site settings" }, 500);
  }
});

adminRoutes.post("/broadcast", async (c) => {
  try {
    const sql = c.get("sql");
    const body = await c.req.json();
    const { target, title, message } = body;

    if (!target || !title || !message) {
      return c.json({ error: "Target, title, and message required" }, 400);
    }

    let whereClause = "";
    if (target === "buyer") whereClause = "WHERE role = 'buyer'";
    else if (target === "seller") whereClause = "WHERE role = 'seller'";
    else if (target !== "all") return c.json({ error: "Invalid target" }, 400);

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

    // Log audit
    await sql`
      INSERT INTO audit_logs (action, details, type, created_at)
      VALUES ('Broadcast Sent', 'Sent to ${target}: ${title}', 'broadcast', NOW())
    `;

    return c.json({ success: true, sent: users.length });
  } catch (error) {
    console.error("Broadcast error:", error);
    return c.json({ error: "Failed to send broadcast" }, 500);
  }
});