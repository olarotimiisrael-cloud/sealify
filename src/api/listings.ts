import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const listingsRoutes = new Hono();

// Get all listings with filters
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

    let whereClause = "WHERE l.status = $1";
    const params: any[] = [status];
    let paramIndex = 2;

    if (category && category !== "All") {
      whereClause += ` AND l.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (condition && condition !== "All") {
      whereClause += ` AND l.condition = $${paramIndex}`;
      params.push(condition);
      paramIndex++;
    }

    if (location) {
      whereClause += ` AND l.location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    if (minPrice) {
      whereClause += ` AND l.price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      whereClause += ` AND l.price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (searchQuery) {
      whereClause += ` AND (l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex} OR l.category_id ILIKE $${paramIndex})`;
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

    if (featured === "true") {
      whereClause += ` AND l.featured = true`;
    }

    let orderClause = "ORDER BY l.created_at DESC";
    if (sortBy === "price-asc") orderClause = "ORDER BY l.price ASC";
    else if (sortBy === "price-desc") orderClause = "ORDER BY l.price DESC";
    else if (sortBy === "popular") orderClause = "ORDER BY l.views_count DESC";

    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    const listings = await sql`
      SELECT 
        l.*,
        u.full_name as seller_name,
        u.phone_number as seller_phone,
        u.avatar_url as seller_avatar,
        u.verified as seller_verified,
        u.verification_type as seller_verification_type
      FROM listings l
      LEFT JOIN users u ON l.seller_id = u.id
      ${sql(whereClause)}
      ${sql(orderClause)}
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total FROM listings l
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

// Get single listing
listingsRoutes.get("/:id", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const id = c.req.param("id");

    const listing = await sql`
      SELECT 
        l.*,
        u.full_name as seller_name,
        u.phone_number as seller_phone,
        u.avatar_url as seller_avatar,
        u.verified as seller_verified,
        u.verification_type as seller_verification_type
      FROM listings l
      LEFT JOIN users u ON l.seller_id = u.id
      WHERE l.id = ${id}
    `;

    if (listing.length === 0) {
      return c.json({ error: "Listing not found" }, 404);
    }

    // Increment view count
    await sql`UPDATE listings SET views_count = views_count + 1 WHERE id = ${id}`;

    return c.json({ listing: listing[0] });
  } catch (error) {
    console.error("Get listing error:", error);
    return c.json({ error: "Failed to fetch listing" }, 500);
  }
});

// Create listing
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
      title,
      description,
      price,
      category,
      condition,
      location,
      images = [],
      videoUrl,
      specifications = {},
      featured = false
    } = body;

    if (!title || !description || !price || !category || !condition || !location) {
      return c.json({ error: "All required fields must be provided" }, 400);
    }

    const sql = getSql(env);
    
    const result = await sql`
      INSERT INTO listings (
        seller_id, title, description, price, category_id, condition, location,
        images, video_url, specifications, featured, status, views_count, created_at, updated_at
      ) VALUES (
        ${user.id}, ${title}, ${description}, ${price}, ${category}, ${condition}, ${location},
        ${images}, ${videoUrl || null}, ${JSON.stringify(specifications)}, ${featured}, 'active', 1, NOW(), NOW()
      )
      RETURNING *
    `;

    return c.json({ listing: result[0] }, 201);
  } catch (error) {
    console.error("Create listing error:", error);
    return c.json({ error: "Failed to create listing" }, 500);
  }
});

// Update listing
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

    // Check ownership
    const existing = await sql`SELECT seller_id FROM listings WHERE id = ${id}`;
    if (existing.length === 0) {
      return c.json({ error: "Listing not found" }, 404);
    }
    if (existing[0].seller_id !== user.id) {
      return c.json({ error: "Not authorized to update this listing" }, 403);
    }

    const allowedFields = [
      'title', 'description', 'price', 'category_id', 'condition', 'location',
      'images', 'video_url', 'specifications', 'featured', 'status',
      'promotion_plan_name', 'promotion_duration_months', 'promotion_start_date', 'promotion_end_date'
    ];

    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const result = await sql`
      UPDATE listings SET 
        ${sql(updates)}
      WHERE id = ${id}
      RETURNING *
    `;

    return c.json({ listing: result[0] });
  } catch (error) {
    console.error("Update listing error:", error);
    return c.json({ error: "Failed to update listing" }, 500);
  }
});

// Delete listing
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

    // Check ownership
    const existing = await sql`SELECT seller_id FROM listings WHERE id = ${id}`;
    if (existing.length === 0) {
      return c.json({ error: "Listing not found" }, 404);
    }
    if (existing[0].seller_id !== user.id) {
      return c.json({ error: "Not authorized to delete this listing" }, 403);
    }

    await sql`DELETE FROM listings WHERE id = ${id}`;

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete listing error:", error);
    return c.json({ error: "Failed to delete listing" }, 500);
  }
});

// Mark as sold
listingsRoutes.post("/:id/sold", async (c) => {
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

    const existing = await sql`SELECT seller_id FROM listings WHERE id = ${id}`;
    if (existing.length === 0) {
      return c.json({ error: "Listing not found" }, 404);
    }
    if (existing[0].seller_id !== user.id) {
      return c.json({ error: "Not authorized" }, 403);
    }

    const result = await sql`
      UPDATE listings SET status = 'sold', updated_at = NOW() WHERE id = ${id} RETURNING *
    `;

    return c.json({ listing: result[0] });
  } catch (error) {
    console.error("Mark sold error:", error);
    return c.json({ error: "Failed to mark as sold" }, 500);
  }
});

// Toggle featured
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

    const existing = await sql`SELECT seller_id, featured FROM listings WHERE id = ${id}`;
    if (existing.length === 0) {
      return c.json({ error: "Listing not found" }, 404);
    }
    if (existing[0].seller_id !== user.id) {
      return c.json({ error: "Not authorized" }, 403);
    }

    const newFeatured = !existing[0].featured;
    const result = await sql`
      UPDATE listings SET featured = ${newFeatured}, updated_at = NOW() WHERE id = ${id} RETURNING *
    `;

    return c.json({ listing: result[0] });
  } catch (error) {
    console.error("Toggle featured error:", error);
    return c.json({ error: "Failed to toggle featured" }, 500);
  }
});

// Get categories with counts
listingsRoutes.get("/meta/categories", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);

    const categories = await sql`
      SELECT category_id as category, COUNT(*) as count
      FROM listings
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

// Import Supabase client
import { createClient } from "@supabase/supabase-js";