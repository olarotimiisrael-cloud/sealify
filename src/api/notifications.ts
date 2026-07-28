import { Hono } from "hono";
import { getSql, query, queryOne, execute } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const notificationsRoutes = new Hono();

// Get notifications for current user
notificationsRoutes.get("/", async (c) => {
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

    const sql = getSql(env);
    const { limit = "50", offset = "0", unreadOnly } = c.req.query();

    let whereClause = "WHERE user_id = $1";
    const params: any[] = [user.id];

    if (unreadOnly === "true") {
      whereClause += " AND read = false";
    }

    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offsetNum = parseInt(offset) || 0;

    const notifications = await sql`
      SELECT * FROM notifications
      ${sql(whereClause)}
      ORDER BY created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    const unreadCount = await sql`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user.id} AND read = false
    `;

    return c.json({
      notifications,
      unreadCount: parseInt(unreadCount[0]?.count || "0"),
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return c.json({ error: "Failed to fetch notifications" }, 500);
  }
});

// Mark notification as read
notificationsRoutes.put("/:id/read", async (c) => {
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

    const result = await sql`
      UPDATE notifications SET read = true 
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Notification not found" }, 404);
    }

    return c.json({ notification: result[0] });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return c.json({ error: "Failed to mark as read" }, 500);
  }
});

// Mark all notifications as read
notificationsRoutes.put("/read-all", async (c) => {
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

    const sql = getSql(env);

    await sql`
      UPDATE notifications SET read = true WHERE user_id = ${user.id} AND read = false
    `;

    return c.json({ success: true });
  } catch (error) {
    console.error("Mark all read error:", error);
    return c.json({ error: "Failed to mark all as read" }, 500);
  }
});

// Delete notification
notificationsRoutes.delete("/:id", async (c) => {
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

    await sql`DELETE FROM notifications WHERE id = ${id} AND user_id = ${user.id}`;

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete notification error:", error);
    return c.json({ error: "Failed to delete notification" }, 500);
  }
});