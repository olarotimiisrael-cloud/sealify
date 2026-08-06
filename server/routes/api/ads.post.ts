import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { getSql } from "../../db/hyperdrive";

export default defineHandler(async (event) => {
  try {
    const env = event.context.cloudflare?.env;
    if (!env?.HYPERDRIVE) {
      throw createError({ statusCode: 500, statusMessage: 'Database not configured' });
    }

    const authHeader = event.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    // Verify user via Supabase
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;
    
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: supabaseKey }
    });
    
    if (!userRes.ok) {
      throw createError({ statusCode: 401, statusMessage: "Invalid token" });
    }
    
    const { user } = await userRes.json();
    const sql = getSql(env);
    const body = await readBody(event);

    const {
      title, description, price, category_id, subcategory_id,
      condition, location, images = [], video_url, specifications = {}
    } = body;

    // Validation
    if (!title || !description || !price || !category_id || !condition || !location) {
      throw createError({ statusCode: 400, statusMessage: "All required fields must be provided" });
    }
    if (images.length === 0) {
      throw createError({ statusCode: 400, statusMessage: "At least one image is required" });
    }

    // Check daily post limit (anti-spam)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const postCount = await sql`
      SELECT COUNT(*) as count FROM ads 
      WHERE seller_id = ${user.id} AND created_at >= ${todayStart.toISOString()}
    `;
    if (Number(postCount[0]?.count || 0) >= 10) {
      throw createError({ statusCode: 429, statusMessage: "Daily post limit reached (10 ads/day)" });
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

    // Create notification for followers (optional)
    await sql`
      INSERT INTO notifications (user_id, type, title, description, link_url, created_at)
      SELECT follower_id, 'new_listing', 'New listing from ' || p.full_name, ${title}, '/listing/' || ${result[0].id}, NOW()
      FROM follows f JOIN profiles p ON p.id = f.following_id
      WHERE f.follower_id != ${user.id}
    `.catch(() => {}); // Ignore if follows table doesn't exist

    return { ad: result[0] };
  } catch (error) {
    console.error("Create ad error:", error);
    throw error;
  }
});