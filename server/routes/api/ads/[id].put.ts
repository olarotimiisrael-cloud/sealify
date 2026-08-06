import { defineHandler } from "nitro";
import { readBody, createError, getRouterParam } from "nitro/h3";
import { getSql } from "../../../db/hyperdrive";

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
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    // Check ownership
    const existing = await sql`SELECT seller_id FROM ads WHERE id = ${id}`;
    if (existing.length === 0) {
      throw createError({ statusCode: 404, statusMessage: "Ad not found" });
    }
    if (existing[0].seller_id !== user.id) {
      throw createError({ statusCode: 403, statusMessage: "Not authorized to update this ad" });
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
      throw createError({ statusCode: 404, statusMessage: "Ad not found" });
    }

    return { ad: result[0] };
  } catch (error) {
    console.error("Update ad error:", error);
    throw error;
  }
});