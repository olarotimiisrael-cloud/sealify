import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";

export const searchRoutes = new Hono();

searchRoutes.get("/", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const { q, category, location, minPrice, maxPrice, condition, sortBy = "newest", limit = "20", offset = "0" } = c.req.query();

    let whereClause = "WHERE a.status = 'active'";
    const params: any[] = [];
    let paramIndex = 1;

    if (q) {
      whereClause += ` AND (a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex} OR a.category_id ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (category && category !== "All") {
      whereClause += ` AND a.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (location) {
      whereClause += ` AND a.location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    if (minPrice) {
      whereClause += ` AND a.price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      whereClause += ` AND a.price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (condition && condition !== "All") {
      whereClause += ` AND a.condition = $${paramIndex}`;
      params.push(condition);
      paramIndex++;
    }

    let orderClause = "ORDER BY a.created_at DESC";
    if (sortBy === "price-asc") orderClause = "ORDER BY a.price ASC";
    else if (sortBy === "price-desc") orderClause = "ORDER BY a.price DESC";
    else if (sortBy === "popular") orderClause = "ORDER BY a.views_count DESC";

    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    const listings = await sql`
      SELECT 
        a.*,
        p.full_name as seller_name,
        p.phone_number as seller_phone,
        p.avatar_url as seller_avatar,
        p.verified as seller_verified,
        p.verification_type as seller_verification_type
      FROM ads a
      LEFT JOIN profiles p ON a.seller_id = p.id
      ${sql(whereClause)}
      ${sql(orderClause)}
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    const countResult = await sql`
      SELECT COUNT(*) as total FROM ads a
      ${sql(whereClause)}
    `;

    return c.json({
      listings,
      total: parseInt(countResult[0]?.total || "0"),
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error("Search error:", error);
    return c.json({ error: "Search failed" }, 500);
  }
});

searchRoutes.get("/suggestions", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const { q } = c.req.query();

    if (!q || q.length < 2) {
      return c.json({ suggestions: [] });
    }

    const suggestions = await sql`
      SELECT DISTINCT title FROM ads
      WHERE status = 'active' AND title ILIKE $1
      LIMIT 10
    `;

    const categories = await sql`
      SELECT DISTINCT category_id FROM ads
      WHERE status = 'active' AND category_id ILIKE $1
      LIMIT 5
    `;

    return c.json({
      suggestions: [
        ...suggestions.map(s => s.title),
        ...categories.map(c => c.category_id)
      ].slice(0, 10)
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return c.json({ suggestions: [] });
  }
});

searchRoutes.get("/trending", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);

    const trending = await sql`
      SELECT category_id as category, COUNT(*) as count, AVG(price) as avg_price
      FROM ads
      WHERE status = 'active' AND created_at > NOW() - INTERVAL '7 days'
      GROUP BY category_id
      ORDER BY count DESC
      LIMIT 10
    `;

    return c.json({ trending });
  } catch (error) {
    console.error("Trending search error:", error);
    return c.json({ trending: [] });
  }
});

searchRoutes.post("/alerts", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const body = await c.req.json();
    const { query, category, maxPrice, location } = body;

    if (!query) {
      return c.json({ error: "Query is required" }, 400);
    }

    const sql = getSql(env);

    const result = await sql`
      INSERT INTO search_alerts (user_id, query, category_id, max_price, location, is_active, created_at, updated_at)
      VALUES (${user.id}, ${query}, ${category || null}, ${maxPrice || null}, ${location || null}, true, NOW(), NOW())
      RETURNING *
    `;

    return c.json({ alert: result[0] }, 201);
  } catch (error) {
    console.error("Create search alert error:", error);
    return c.json({ error: "Failed to create search alert" }, 500);
  }
});

searchRoutes.get("/alerts", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const sql = getSql(env);

    const alerts = await sql`
      SELECT * FROM search_alerts
      WHERE user_id = ${user.id} AND is_active = true
      ORDER BY created_at DESC
    `;

    return c.json({ alerts });
  } catch (error) {
    console.error("Get search alerts error:", error);
    return c.json({ error: "Failed to fetch alerts" }, 500);
  }
});

searchRoutes.delete("/alerts/:id", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const alertId = c.req.param("id");
    const sql = getSql(env);

    // Verify ownership
    const alert = await sql`SELECT user_id FROM search_alerts WHERE id = ${alertId}`;
    if (alert.length === 0 || alert[0].user_id !== user.id) {
      return c.json({ error: "Not authorized" }, 403);
    }

    await sql`DELETE FROM search_alerts WHERE id = ${alertId}`;

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete search alert error:", error);
    return c.json({ error: "Failed to delete alert" }, 500);
  }
});