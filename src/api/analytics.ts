import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const analyticsRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql> } }>();

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

analyticsRoutes.use("/*", requireAdmin);

analyticsRoutes.get("/overview", async (c) => {
  try {
    const sql = c.get("sql");

    const [
      totalUsers,
      activeUsers,
      totalAds,
      activeAds,
      totalRevenue,
      pendingReports,
      pendingDisputes,
      pendingVerifications
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM profiles`,
      sql`SELECT COUNT(*) as count FROM profiles WHERE status = 'active' AND created_at > NOW() - INTERVAL '30 days'`,
      sql`SELECT COUNT(*) as count FROM ads`,
      sql`SELECT COUNT(*) as count FROM ads WHERE status = 'active'`,
      sql`SELECT SUM(amount) as total FROM promotion_payments WHERE status = 'approved'`,
      sql`SELECT COUNT(*) as count FROM reports WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM disputes WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM verification_requests WHERE status = 'pending'`,
    ]);

    return c.json({
      users: { total: totalUsers[0]?.count || 0, active: activeUsers[0]?.count || 0 },
      ads: { total: totalAds[0]?.count || 0, active: activeAds[0]?.count || 0 },
      revenue: totalRevenue[0]?.total || 0,
      pending: {
        reports: pendingReports[0]?.count || 0,
        disputes: pendingDisputes[0]?.count || 0,
        verifications: pendingVerifications[0]?.count || 0
      }
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});

analyticsRoutes.get("/users/growth", async (c) => {
  try {
    const sql = c.get("sql");
    const { days = "30" } = c.req.query();

    const growth = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM profiles
      WHERE created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return c.json({ growth });
  } catch (error) {
    console.error("User growth error:", error);
    return c.json({ error: "Failed to fetch user growth" }, 500);
  }
});

analyticsRoutes.get("/ads/performance", async (c) => {
  try {
    const sql = c.get("sql");

    const performance = await sql`
      SELECT 
        category_id as category,
        COUNT(*) as total_ads,
        AVG(price) as avg_price,
        SUM(views_count) as total_views,
        COUNT(*) FILTER (WHERE status = 'sold') as sold_count
      FROM ads
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY category_id
      ORDER BY total_ads DESC
    `;

    return c.json({ performance });
  } catch (error) {
    console.error("Ads performance error:", error);
    return c.json({ error: "Failed to fetch ads performance" }, 500);
  }
});

analyticsRoutes.get("/revenue", async (c) => {
  try {
    const sql = c.get("sql");
    const { days = "30" } = c.req.query();

    const revenue = await sql`
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as daily_revenue,
        COUNT(*) as promotion_count
      FROM promotion_payments
      WHERE status = 'approved'
      AND created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return c.json({ revenue });
  } catch (error) {
    console.error("Revenue analytics error:", error);
    return c.json({ error: "Failed to fetch revenue" }, 500);
  }
});

analyticsRoutes.get("/categories", async (c) => {
  try {
    const sql = c.get("sql");

    const categories = await sql`
      SELECT 
        c.name as category,
        COUNT(a.id) as total_ads,
        AVG(a.price) as avg_price,
        SUM(a.views_count) as total_views
      FROM categories c
      LEFT JOIN ads a ON a.category_id = c.id AND a.status = 'active'
      WHERE c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY total_ads DESC
    `;

    return c.json({ categories });
  } catch (error) {
    console.error("Categories analytics error:", error);
    return c.json({ error: "Failed to fetch categories analytics" }, 500);
  }
});

analyticsRoutes.get("/events", async (c) => {
  try {
    const sql = c.get("sql");
    const { event, limit = "100", offset = "0" } = c.req.query();

    let whereClause = "";
    const params: any[] = [];
    let paramIndex = 1;

    if (event) {
      whereClause = "WHERE event_name = $1";
      params.push(event);
      paramIndex++;
    }

    const limitNum = Math.min(parseInt(limit) || 100, 500);
    const offsetNum = parseInt(offset) || 0;

    const events = await sql`
      SELECT * FROM analytics_events
      ${sql(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    return c.json({ events });
  } catch (error) {
    console.error("Analytics events error:", error);
    return c.json({ error: "Failed to fetch events" }, 500);
  }
});

analyticsRoutes.get("/performance", async (c) => {
  try {
    const sql = c.get("sql");
    const { metric, limit = "100" } = c.req.query();

    let whereClause = "";
    const params: any[] = [];

    if (metric) {
      whereClause = "WHERE metric_name = $1";
      params.push(metric);
    }

    const limitNum = Math.min(parseInt(limit) || 100, 500);

    const metrics = await sql`
      SELECT 
        metric_name,
        AVG(value) as avg_value,
        COUNT(*) as samples,
        COUNT(*) FILTER (WHERE rating = 'good') as good_count,
        COUNT(*) FILTER (WHERE rating = 'needs-improvement') as needs_improvement_count,
        COUNT(*) FILTER (WHERE rating = 'poor') as poor_count
      FROM performance_metrics
      ${sql(whereClause)}
      GROUP BY metric_name
      ORDER BY avg_value DESC
      LIMIT ${limitNum}
    `;

    return c.json({ metrics });
  } catch (error) {
    console.error("Performance analytics error:", error);
    return c.json({ error: "Failed to fetch performance" }, 500);
  }
});
