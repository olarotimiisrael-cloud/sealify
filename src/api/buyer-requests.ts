import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const buyerRequestsRoutes = new Hono();

buyerRequestsRoutes.get("/", async (c) => {
  try {
    const env = c.env as any;
    const sql = getSql(env);
    const { category, status = "open", limit = "20", offset = "0" } = c.req.query();

    let whereClause = "WHERE status = $1";
    const params: any[] = [status];
    let paramIndex = 2;

    if (category && category !== "All") {
      whereClause += ` AND category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    const requests = await sql`
      SELECT * FROM buyer_requests
      ${sql(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    return c.json({ requests });
  } catch (error) {
    console.error("Get buyer requests error:", error);
    return c.json({ error: "Failed to fetch buyer requests" }, 500);
  }
});

buyerRequestsRoutes.post("/", async (c) => {
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
    const { title, category_id, max_budget, location, description } = body;

    if (!title || !category_id || !max_budget || !location || !description) {
      return c.json({ error: "All fields are required" }, 400);
    }

    const sql = getSql(env);
    const profile = await sql`SELECT full_name, avatar_url FROM profiles WHERE id = ${user.id}`;

    const result = await sql`
      INSERT INTO buyer_requests (user_id, user_name, user_avatar, title, category_id, max_budget, location, description, status, created_at, updated_at)
      VALUES (${user.id}, ${profile[0]?.full_name || 'User'}, ${profile[0]?.avatar_url || null}, ${title}, ${category_id}, ${max_budget}, ${location}, ${description}, 'open', NOW(), NOW())
      RETURNING *
    `;

    return c.json({ request: result[0] }, 201);
  } catch (error) {
    console.error("Create buyer request error:", error);
    return c.json({ error: "Failed to create request" }, 500);
  }
});

buyerRequestsRoutes.post("/:id/respond", async (c) => {
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

    const requestId = c.req.param("id");
    const body = await c.req.json();
    const { proposed_price, message } = body;

    if (!proposed_price) {
      return c.json({ error: "Proposed price is required" }, 400);
    }

    const sql = getSql(env);
    const profile = await sql`SELECT full_name, avatar_url FROM profiles WHERE id = ${user.id}`;

    // Check if request exists and is open
    const request = await sql`SELECT * FROM buyer_requests WHERE id = ${requestId} AND status = 'open'`;
    if (request.length === 0) {
      return c.json({ error: "Request not found or closed" }, 404);
    }

    const result = await sql`
      INSERT INTO buyer_request_responses (request_id, seller_id, seller_name, seller_avatar, proposed_price, message, status, created_at)
      VALUES (${requestId}, ${user.id}, ${profile[0]?.full_name || 'Seller'}, ${profile[0]?.avatar_url || null}, ${proposed_price}, ${message || null}, 'pending', NOW())
      RETURNING *
    `;

    // Update request status
    await sql`UPDATE buyer_requests SET status = 'responded', responses_count = responses_count + 1 WHERE id = ${requestId}`;

    // Notify buyer
    await sql`
      INSERT INTO notifications (user_id, type, title, description, link_url, created_at)
      VALUES (${request[0].user_id}, 'offer', 'New Offer on Your Request', 'A seller responded to your request', '/requests', NOW())
    `;

    return c.json({ response: result[0] }, 201);
  } catch (error) {
    console.error("Respond to buyer request error:", error);
    return c.json({ error: "Failed to respond" }, 500);
  }
});

buyerRequestsRoutes.put("/:id", async (c) => {
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

    const requestId = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    const sql = getSql(env);

    // Verify ownership
    const request = await sql`SELECT user_id FROM buyer_requests WHERE id = ${requestId}`;
    if (request.length === 0 || request[0].user_id !== user.id) {
      return c.json({ error: "Not authorized" }, 403);
    }

    await sql`
      UPDATE buyer_requests SET status = ${status}, updated_at = NOW() WHERE id = ${requestId}
    `;

    return c.json({ success: true });
  } catch (error) {
    console.error("Update buyer request error:", error);
    return c.json({ error: "Failed to update request" }, 500);
  }
});

buyerRequestsRoutes.delete("/:id", async (c) => {
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

    const requestId = c.req.param("id");
    const sql = getSql(env);

    // Verify ownership
    const request = await sql`SELECT user_id FROM buyer_requests WHERE id = ${requestId}`;
    if (request.length === 0 || request[0].user_id !== user.id) {
      return c.json({ error: "Not authorized" }, 403);
    }

    await sql`DELETE FROM buyer_requests WHERE id = ${requestId}`;

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete buyer request error:", error);
    return c.json({ error: "Failed to delete request" }, 500);
  }
});