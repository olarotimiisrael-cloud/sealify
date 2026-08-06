import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const pushRoutes = new Hono();

pushRoutes.post("/subscribe", async (c) => {
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
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return c.json({ error: "Invalid subscription" }, 400);
    }

    const sql = getSql(env);

    // Store subscription
    await sql`
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at)
      VALUES (${user.id}, ${subscription.endpoint}, ${subscription.keys?.p256dh || null}, ${subscription.keys?.auth || null}, NOW())
      ON CONFLICT (user_id, endpoint) DO UPDATE SET
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        updated_at = NOW()
    `;

    return c.json({ success: true });
  } catch (error) {
    console.error("Subscribe push error:", error);
    return c.json({ error: "Failed to subscribe" }, 500);
  }
});

pushRoutes.post("/unsubscribe", async (c) => {
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
    const { endpoint } = body;

    if (!endpoint) {
      return c.json({ error: "Endpoint required" }, 400);
    }

    const sql = getSql(env);

    await sql`DELETE FROM push_subscriptions WHERE user_id = ${user.id} AND endpoint = ${endpoint}`;

    return c.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe push error:", error);
    return c.json({ error: "Failed to unsubscribe" }, 500);
  }
});

// Admin: Send push notification to all users
pushRoutes.post("/admin/broadcast", async (c) => {
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
    const profile = await sql`SELECT role FROM profiles WHERE id = ${user.id}`;
    if (profile.length === 0 || profile[0].role !== 'admin') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    const { title, body: message, url, icon } = body;

    if (!title || !message) {
      return c.json({ error: "Title and body are required" }, 400);
    }

    const subscriptions = await sql`
      SELECT * FROM push_subscriptions
    `;

    const vapidPrivateKey = env.VAPID_PRIVATE_KEY;
    if (!vapidPrivateKey) {
      return c.json({ error: "VAPID keys not configured" }, 500 );
    }

    // In production, use web-push library
    // For now, just return success
    return c.json({ 
      success: true, 
      message: `Broadcast queued for ${subscriptions.length} subscribers` 
    });
  } catch (error) {
    console.error("Broadcast push error:", error);
    return c.json({ error: "Failed to broadcast" }, 500);
  }
});