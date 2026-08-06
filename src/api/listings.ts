import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const listingsRoutes = new Hono();

listingsRoutes.get("/", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    
    const {
      category,
      condition,
      location,
      minPrice,
      maxPrice,
      searchQuery,
      sortBy = "newest",
      status = "active",
      limit = "20",
      offset = "0",
      featured
    } = c.req.query();

    let whereClause = "WHERE a.status = $1";
    const params: any[] = [status];
    let paramIndex = 2;

    if (category && category !== "All") {
      whereClause += ` AND a.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (condition && condition !== "All") {
      whereClause += ` AND a.condition = $${paramIndex}`;
      params.push(condition);
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

    if (searchQuery) {
      whereClause += ` AND (a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex} OR a.category_id ILIKE $${paramIndex})`;
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

    if (featured === "true") {
      whereClause += ` AND a.featured = true`;
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
    console.error("Get listings error:", error);
    return c.json({ error: "Failed to fetch listings" }, 500);
  }
});

listingsRoutes.get("/:id", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const id = c.req.param("id");

    const listing = await sql`
      SELECT 
        a.*,
        p.full_name as seller_name,
        p.phone_number as seller_phone,
        p.avatar_url as seller_avatar,
        p.verified as seller_verified,
        p.verification_type as seller_verification_type
      FROM ads a
      LEFT JOIN profiles p ON a.seller_id = p.id
      WHERE a.id = ${id}
    `;

    if (listing.length === 0) {
      return c.json({ error: "Listing not found" }, 404);
    }

    await sql`UPDATE ads SET views_count = views_count + 1 WHERE id = ${id}`;

    return c.json({ listing: listing[0] });
  } catch (error) {
    console.error("Get listing error:", error);
    return c.json({ error: "Failed to fetch listing" }, 500);
  }
});

listingsRoutes.post("/", async (c) => {
  try {
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

    const body = await c.req.json();
    const {
      title, description, price, category_id, subcategory_id,
      condition, location, images = [], video_url, specifications = {}
    } = body;

    if (!title || !description || !price || !category_id || !condition || !location) {
      return c.json({ error: "All required fields must be provided" }, 400);
    }
    if (images.length === 0) {
      return c.json({ error: "At least one image is required" }, 400);
    }

    const sql = getSql(env);
    
    // Check daily post limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const postCount = await sql`
      SELECT COUNT(*) as count FROM ads 
      WHERE seller_id = ${user.id} AND created_at >= ${todayStart.toISOString()}
    `;
    if (Number(postCount[0]?.count || 0) >= 10) {
      return c.json({ error: "Daily post limit reached (10 ads/day)" }, 429);
    }

    const result = await sql`
      INSERT INTO ads (
        seller_id, title, description, price, category_id, subcategory_id,
        condition, location, images, video_url, specifications, status, views_count, created_at, updated_at
      ) VALUES (
        ${user.id}, ${title}, ${description}, ${price}, ${category_id}, ${subcategory_id || null},
        ${condition}, ${location}, ${images}, ${video_url || null}, ${JSON.stringify(specifications)}, 
        'active', 1, NOW(), NOW()
      )
      RETURNING *
    `;

    return c.json({ listing: result[0] }, 201);
  } catch (error) {
    console.error("Create listing error:", error);
    return c.json({ error: "Failed to create listing" }, 500);
  }
});

listingsRoutes.put("/:id", async (c) => {
  try {
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

    const id = c.req.param("id");
    const body = await c.req.json();
    const sql = getSql(env);

    const existing = await sql`SELECT seller_id FROM ads WHERE id = ${id}`;
    if (existing.length === 0) {
      return c.json({ error: "Listing not found" }, 404);
    }
    if (existing[0].seller_id !== user.id) {
      return c.json({ error: "Not authorized to update this listing" }, 403);
    }

    const allowedFields = [
      'title', 'description', 'price', 'category_id', 'subcategory_id',
      'condition', 'location', 'images', 'video_url', 'specifications',
      'status', 'featured', 'promotion_plan_name', 'promotion_duration_months',
      'promotion_start_date', 'promotion_end_date'
    ];

    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const result = await sql`
      UPDATE ads SET ${sql(updates)} WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Listing not found" }, 404);
    }

    return c.json({ listing: result[0] });
  } catch (error) {
    console.error("Update listing error:", error);
    return c.json({ error: "Failed to update listing" }, 500);
  }
});

listingsRoutes.delete("/:id", async (c) => {
  try {
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

    const id = c.req.param("id");
    const sql = getSql(env);

    const existing = await sql`SELECT seller_id FROM ads WHERE id = ${id}`;
    if (existing.length === 0) {
      return c.json({ error: "Listing not found" }, 404);
    }
    if (existing[0].seller_id !== user.id) {
      return c.json({ error: "Not authorized to delete this listing" }, 403);
    }

    await sql`DELETE FROM ads WHERE id = ${id}`;

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete listing error:", error);
    return c.json({ error: "Failed to delete listing" }, 500);
  }
});

listingsRoutes.post("/:id/featured", async (c) => {
  try {
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

    const id = c.req.param("id");
    const sql = getSql(env);

    const existing = await sql`SELECT seller_id, featured FROM ads WHERE id = ${id}`;
    if (existing.length === 0) {
      return c.json({ error: "Listing not found" }, 404);
    }
    if (existing[0].seller_id !== user.id) {
      return c.json({ error: "Not authorized" }, 403);
    }

    const newFeatured = !existing[0].featured;
    const result = await sql`
      UPDATE ads SET featured = ${newFeatured}, updated_at = NOW() WHERE id = ${id} RETURNING *
    `;

    return c.json({ listing: result[0] });
  } catch (error) {
    console.error("Toggle featured error:", error);
    return c.json({ error: "Failed to toggle featured" }, 500);
  }
});

listingsRoutes.get("/meta/categories", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);

    const categories = await sql`
      SELECT category_id as category, COUNT(*) as count
      FROM ads
      WHERE status = 'active'
      GROUP BY category_id
      ORDER BY count DESC
    `;

    return c.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});