import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const reviewsRoutes = new Hono();

reviewsRoutes.get("/seller/:sellerId", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const sellerId = c.req.param("sellerId");
    const { limit = "20", offset = "0" } = c.req.query();

    const reviews = await sql`
      SELECT r.*, u.full_name as buyer_name, u.avatar_url as buyer_avatar
      FROM reviews r
      LEFT JOIN profiles u ON r.buyer_id = u.id
      WHERE r.seller_id = ${sellerId} AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    const avgRating = await sql`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM reviews WHERE seller_id = ${sellerId} AND status = 'approved'
    `;

    return c.json({
      reviews,
      avgRating: parseFloat(avgRating[0]?.avg_rating || "0"),
      totalReviews: parseInt(avgRating[0]?.total_reviews || "0")
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return c.json({ error: "Failed to fetch reviews" }, 500);
  }
});

reviewsRoutes.post("/", async (c) => {
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
    const { seller_id, rating, comment } = body;

    if (!seller_id || !rating || !comment) {
      return c.json({ error: "seller_id, rating, and comment are required" }, 400);
    }
    if (rating < 1 || rating > 5) {
      return c.json({ error: "Rating must be between 1 and 5" }, 400);
    }

    const sql = getSql(env);

    // Check if user already reviewed this seller
    const existing = await sql`
      SELECT * FROM reviews WHERE seller_id = ${seller_id} AND buyer_id = ${user.id}
    `;
    if (existing.length > 0) {
      return c.json({ error: "You have already reviewed this seller" }, 400);
    }

    const profile = await sql`SELECT full_name, avatar_url FROM profiles WHERE id = ${user.id}`;

    const result = await sql`
      INSERT INTO reviews (seller_id, buyer_id, buyer_name, buyer_avatar, rating, comment, status, created_at, updated_at)
      VALUES (${seller_id}, ${user.id}, ${profile[0]?.full_name || 'Buyer'}, ${profile[0]?.avatar_url || null}, ${rating}, ${comment}, 'approved', NOW(), NOW())
      RETURNING *
    `;

    return c.json({ review: result[0] }, 201);
  } catch (error) {
    console.error("Create review error:", error);
    return c.json({ error: "Failed to create review" }, 500);
  }
});

reviewsRoutes.put("/:id", async (c) => {
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

    const reviewId = c.req.param("id");
    const body = await c.req.json();
    const { rating, comment } = body;

    if (!rating || !comment) {
      return c.json({ error: "rating and comment are required" }, 400);
    }

    const sql = getSql(env);

    // Verify ownership
    const review = await sql`SELECT buyer_id FROM reviews WHERE id = ${reviewId}`;
    if (review.length === 0 || review[0].buyer_id !== user.id) {
      return c.json({ error: "Not authorized" }, 403);
    }

    const result = await sql`
      UPDATE reviews SET rating = ${rating}, comment = ${comment}, updated_at = NOW() WHERE id = ${reviewId} RETURNING *
    `;

    return c.json({ review: result[0] });
  } catch (error) {
    console.error("Update review error:", error);
    return c.json({ error: "Failed to update review" }, 500);
  }
});

reviewsRoutes.delete("/:id", async (c) => {
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

    const reviewId = c.req.param("id");
    const sql = getSql(env);

    // Verify ownership
    const review = await sql`SELECT buyer_id FROM reviews WHERE id = ${reviewId}`;
    if (review.length === 0 || review[0].buyer_id !== user.id) {
      return c.json({ error: "Not authorized" }, 403);
    }

    await sql`DELETE FROM reviews WHERE id = ${reviewId}`;

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return c.json({ error: "Failed to delete review" }, 500);
  }
});

// Admin: Get all reviews
reviewsRoutes.get("/admin/all", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser(token);
    const sql = getSql(env);
    const profile = await sql`SELECT role FROM profiles WHERE id = ${user.id}`;
    if (profile.length === 0 || profile[0].role !== 'admin') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const { status, limit = "50", offset = "0" } = c.req.query();

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offsetNum = parseInt(offset) || 0;

    const reviews = await sql`
      SELECT r.*, u1.full_name as seller_name, u2.full_name as buyer_name
      FROM reviews r
      LEFT JOIN profiles u1 ON r.seller_id = u1.id
      LEFT JOIN profiles u2 ON r.buyer_id = u2.id
      ${sql(whereClause)}
      ORDER BY r.created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    return c.json({ reviews });
  } catch (error) {
    console.error("Get admin reviews error:", error);
    return c.json({ error: "Failed to fetch reviews" }, 500);
  }
});

// Admin: Update review status
reviewsRoutes.put("/admin/:id", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser(token);
    const sql = getSql(env);
    const profile = await sql`SELECT role FROM profiles WHERE id = ${user.id}`;
    if (!profile[0] || profile[0].role !== 'admin') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const reviewId = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    const result = await sql`
      UPDATE reviews SET status = ${status}, updated_at = NOW() WHERE id = ${reviewId} RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Review not found" }, 404);
    }

    return c.json({ review: result[0] });
  } catch (error) {
    console.error("Update review status error:", error);
    return c.json({ error: "Failed to update review" }, 500);
  }
});

// Admin: Delete review
reviewsRoutes.delete("/admin/:id", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser(token);
    const sql = getSql(env);
    const profile = await sql`SELECT role FROM profiles WHERE id = ${user.id}`;
    if (!profile[0] || profile[0].role !== 'admin') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const reviewId = c.req.param("id");
    await sql`DELETE FROM reviews WHERE id = ${reviewId}`;

    return c.json({ success: true });
  } catch (error) {
    console.error("Admin delete review error:", error);
    return c.json({ error: "Failed to delete review" }, 500);
  }
});