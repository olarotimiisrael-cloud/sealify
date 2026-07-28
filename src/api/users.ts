import { Hono } from "hono";
import { getSql, queryDb, queryOneDb, executeDb } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const usersRoutes = new Hono();

// Get all users (admin only)
usersRoutes.get("/", async (c) => {
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

    // Check if admin
    const sql = getSql(env);
    const profile = await sql`SELECT role FROM users WHERE id = ${user.id}`;
    if (profile.length === 0 || profile[0].role !== 'admin') {
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    const {
      search,
      role,
      status,
      verified,
      limit = "50",
      offset = "0"
    } = c.req.query();

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
      SELECT * FROM users
      ${sql(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    const countResult = await sql`
      SELECT COUNT(*) as total FROM users ${sql(whereClause)}
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

// Get user by ID
usersRoutes.get("/:id", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const id = c.req.param("id");

    const user = await sql`SELECT * FROM users WHERE id = ${id}`;

    if (user.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    // Get user's listings count
    const listingsCount = await sql`
      SELECT COUNT(*) as count FROM listings WHERE seller_id = ${id}
    `;

    return c.json({
      user: user[0],
      listingsCount: parseInt(listingsCount[0]?.count || "0")
    });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

// Update user (admin or self)
usersRoutes.put("/:id", async (c) => {
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

    // Check if admin or self
    const requester = await sql`SELECT role FROM users WHERE id = ${user.id}`;
    const isAdmin = requester.length > 0 && requester[0].role === 'admin';
    
    if (!isAdmin && user.id !== id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    
    const allowedFields = [
      'full_name', 'phone_number', 'avatar_url', 'store_banner_url',
      'bio', 'location', 'business_name', 'cac_number', 'business_hours',
      'bank_name', 'account_number', 'account_name',
      'website_url', 'instagram_handle', 'twitter_handle', 'whatsapp_number',
      'email_notifications', 'whatsapp_notifications', 'hide_phone_publicly', 'hide_location_publicly'
    ];

    // Admin-only fields
    if (isAdmin) {
      allowedFields.push('role', 'status', 'verified', 'verification_type', 'restriction_reason', 'appeal_status');
    }

    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const result = await sql`
      UPDATE users SET 
        ${sql(updates)}
      WHERE id = ${id}
      RETURNING *
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

// Delete user (admin only)
usersRoutes.delete("/:id", async (c) => {
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

    // Check if admin
    const sql = getSql(env);
    const requester = await sql`SELECT role FROM users WHERE id = ${user.id}`;
    if (requester.length === 0 || requester[0].role !== 'admin') {
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    const id = c.req.param("id");
    
    // Don't allow deleting self
    if (user.id === id) {
      return c.json({ error: "Cannot delete your own account" }, 400);
    }

    await sql`DELETE FROM users WHERE id = ${id}`;

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

// Get user's listings
usersRoutes.get("/:id/listings", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const id = c.req.param("id");
    const { status = "active", limit = "20", offset = "0" } = c.req.query();

    const listings = await sql`
      SELECT * FROM listings 
      WHERE seller_id = ${id} AND status = ${status}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    return c.json({ listings });
  } catch (error) {
    console.error("Get user listings error:", error);
    return c.json({ error: "Failed to fetch user listings" }, 500);
  }
});

// Get user's reviews
usersRoutes.get("/:id/reviews", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const id = c.req.param("id");

    const reviews = await sql`
      SELECT r.*, u.full_name as buyer_name, u.avatar_url as buyer_avatar
      FROM reviews r
      LEFT JOIN users u ON r.buyer_id = u.id
      WHERE r.seller_id = ${id}
      ORDER BY r.created_at DESC
    `;

    return c.json({ reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    return c.json({ error: "Failed to fetch reviews" }, 500);
  }
});