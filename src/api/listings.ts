import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";
import { requireAuth, sanitizeInput, auditLog, rateLimit } from "../middleware/security";
import { z } from "zod";

export const listingsRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql>; user: any; supabase: any } }>();

// Validation schemas
const createListingSchema = z.object({
  title: z.string().min(5, "Title too short").max(100, "Title too long"),
  description: z.string().min(20, "Description too short").max(5000, "Description too long"),
  price: z.number().positive("Price must be positive").max(100000000, "Price too high"),
  category_id: z.string().min(1, "Category required"),
  subcategory_id: z.string().optional().nullable(),
  condition: z.enum(["Brand New", "Like New", "Used - Good", "Used - Fair"]),
  location: z.string().min(2, "Location required").max(100),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image required").max(10, "Max 10 images"),
  video_url: z.string().url().optional().nullable(),
  specifications: z.record(z.string()).optional(),
});

const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(["active", "sold", "draft", "pending_review"]).optional(),
  featured: z.boolean().optional(),
  promotion_plan_name: z.string().optional().nullable(),
  promotion_duration_months: z.number().int().min(1).max(12).optional().nullable(),
  promotion_start_date: z.string().datetime().optional().nullable(),
  promotion_end_date: z.string().datetime().optional().nullable(),
});

const querySchema = z.object({
  category: z.string().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  searchQuery: z.string().optional(),
  sortBy: z.enum(["newest", "price-asc", "price-desc", "popular"]).optional(),
  status: z.enum(["active", "sold", "draft", "pending_review"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  featured: z.coerce.boolean().optional(),
});

// Rate limiting
const listingsRateLimit = rateLimit({ windowMs: 60000, maxRequests: 60 }); // 60 req/min

// GET /api/listings - List with filters
listingsRoutes.get("/", listingsRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);

    const query = querySchema.parse(c.req.query());
    const {
      category, condition, location, minPrice, maxPrice,
      searchQuery, sortBy = "newest", status = "active",
      limit = "20", offset = "0", featured
    } = query;

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
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      whereClause += ` AND a.price <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }

    if (searchQuery) {
      whereClause += ` AND (a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex} OR a.category_id ILIKE $${paramIndex})`;
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

    if (featured === true) {
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
        CASE WHEN COALESCE(p.hide_phone_publicly, false) THEN NULL ELSE p.phone_number END as seller_phone,
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
    if (error instanceof HTTPException) throw error;
    console.error("Get listings error:", error);
    throw new HTTPException(500, { message: "Failed to fetch listings" });
  }
});

// GET /api/listings/:id - Get single listing
listingsRoutes.get("/:id", listingsRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const id = c.req.param("id");

    const listing = await sql`
      SELECT
        a.*,
        p.full_name as seller_name,
        CASE WHEN COALESCE(p.hide_phone_publicly, false) THEN NULL ELSE p.phone_number END as seller_phone,
        p.avatar_url as seller_avatar,
        p.verified as seller_verified,
        p.verification_type as seller_verification_type
      FROM ads a
      LEFT JOIN profiles p ON a.seller_id = p.id
      WHERE a.id = ${id}
    `;

    if (listing.length === 0) {
      throw new HTTPException(404, { message: "Listing not found" });
    }

    // Increment view count
    await sql`UPDATE ads SET views_count = views_count + 1 WHERE id = ${id}`;

    return c.json({ listing: listing[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Get listing error:", error);
    throw new HTTPException(500, { message: "Failed to fetch listing" });
  }
});

// POST /api/listings - Create listing
listingsRoutes.post("/", requireAuth, async (c) => {
  try {
    const env = c.env as any;
    const user = c.get("user");
    const sql = getSql(env);
    const body = await c.req.json();

    const validated = createListingSchema.parse(body);
    const {
      title, description, price, category_id, subcategory_id,
      condition, location, images, video_url, specifications = {}
    } = validated;

    // Check daily post limit (anti-spam)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const postCount = await sql`
      SELECT COUNT(*) as count FROM ads
      WHERE seller_id = ${user.id} AND created_at >= ${todayStart.toISOString()}
    `;
    if (Number(postCount[0]?.count || 0) >= 10) {
      throw new HTTPException(429, { message: "Daily post limit reached (10 ads/day)" });
    }

    // Sanitize text fields
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedLocation = sanitizeInput(location);

    const result = await sql`
      INSERT INTO ads (
        seller_id, title, description, price, category_id, subcategory_id,
        condition, location, images, video_url, specifications, status, views_count, created_at, updated_at
      ) VALUES (
        ${user.id}, ${sanitizedTitle}, ${sanitizedDescription}, ${price}, ${category_id}, ${subcategory_id || null},
        ${condition}, ${sanitizedLocation}, ${images}, ${video_url || null}, ${JSON.stringify(specifications)},
        'active', 1, NOW(), NOW()
      )
      RETURNING *
    `;

    await auditLog(getSql(c.env), user.id, "Listing Created", `Created listing: ${sanitizedTitle}`, "listing");

    return c.json({ listing: result[0] }, 201);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: "Validation failed", cause: error.errors });
    }
    console.error("Create listing error:", error);
    throw new HTTPException(500, { message: "Failed to create listing" });
  }
});

// PUT /api/listings/:id - Update listing
listingsRoutes.put("/:id", requireAuth, async (c) => {
  try {
    const env = c.env as any;
    const user = c.get("user");
    const sql = getSql(env);
    const id = c.req.param("id");
    const body = await c.req.json();

    const validated = updateListingSchema.parse(body);

    // Check ownership
    const existing = await sql`SELECT seller_id FROM ads WHERE id = ${id}`;
    if (existing.length === 0) {
      throw new HTTPException(404, { message: "Listing not found" });
    }
    if (existing[0].seller_id !== user.id) {
      throw new HTTPException(403, { message: "Not authorized to update this listing" });
    }

    const allowedFields = [
      'title', 'description', 'price', 'category_id', 'subcategory_id',
      'condition', 'location', 'images', 'video_url', 'specifications',
      'status', 'featured', 'promotion_plan_name', 'promotion_duration_months',
      'promotion_start_date', 'promotion_end_date'
    ];

    const updates: any = { updated_at: new Date() };
    for (const field of allowedFields) {
      if (validated[field as keyof typeof validated] !== undefined) {
        updates[field] = validated[field as keyof typeof validated];
      }
    }

    // Sanitize text fields
    for (const key of Object.keys(updates)) {
      if (typeof updates[key] === 'string') {
        updates[key] = sanitizeInput(updates[key]);
      }
    }

    const result = await sql`
      UPDATE ads SET ${sql(updates)} WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      throw new HTTPException(404, { message: "Listing not found" });
    }

    await auditLog(getSql(c.env), user.id, "Listing Updated", `Updated listing ${id}`, "listing");

    return c.json({ listing: result[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: "Validation failed", cause: error.errors });
    }
    console.error("Update listing error:", error);
    throw new HTTPException(500, { message: "Failed to update listing" });
  }
});

// DELETE /api/listings/:id - Delete listing
listingsRoutes.delete("/:id", requireAuth, async (c) => {
  try {
    const env = c.env as any;
    const user = c.get("user");
    const sql = getSql(env);
    const id = c.req.param("id");

    const existing = await sql`SELECT seller_id FROM ads WHERE id = ${id}`;
    if (existing.length === 0) {
      throw new HTTPException(404, { message: "Listing not found" });
    }
    if (existing[0].seller_id !== user.id) {
      throw new HTTPException(403, { message: "Not authorized to delete this listing" });
    }

    await sql`DELETE FROM ads WHERE id = ${id}`;

    await auditLog(getSql(c.env), user.id, "Listing Deleted", `Deleted listing ${id}`, "listing");

    return c.json({ success: true });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Delete listing error:", error);
    throw new HTTPException(500, { message: "Failed to delete listing" });
  }
});

// POST /api/listings/:id/featured - Toggle featured
listingsRoutes.post("/:id/featured", requireAuth, async (c) => {
  try {
    const env = c.env as any;
    const user = c.get("user");
    const sql = getSql(env);
    const id = c.req.param("id");

    const existing = await sql`SELECT seller_id, featured FROM ads WHERE id = ${id}`;
    if (existing.length === 0) {
      throw new HTTPException(404, { message: "Listing not found" });
    }
    if (existing[0].seller_id !== user.id) {
      throw new HTTPException(403, { message: "Not authorized" });
    }

    const newFeatured = !existing[0].featured;
    const result = await sql`
      UPDATE ads SET featured = ${newFeatured}, updated_at = NOW() WHERE id = ${id} RETURNING *
    `;

    await auditLog(getSql(c.env), user.id, "Featured Toggled", `Listing ${id} featured: ${newFeatured}`, "listing");

    return c.json({ listing: result[0] });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Toggle featured error:", error);
    throw new HTTPException(500, { message: "Failed to toggle featured" });
  }
});

// GET /api/listings/meta/categories - Get category stats
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
    throw new HTTPException(500, { message: "Failed to fetch categories" });
  }
});

export default listingsRoutes;
