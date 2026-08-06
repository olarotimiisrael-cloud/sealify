import { defineHandler } from "nitro";
import { createError, getRouterParam } from "nitro/h3";
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

    // Check ownership
    const existing = await sql`SELECT seller_id FROM ads WHERE id = ${id}`;
    if (existing.length === 0) {
      throw createError({ statusCode: 404, statusMessage: "Ad not found" });
    }
    if (existing[0].seller_id !== user.id) {
      throw createError({ statusCode: 403, statusMessage: "Not authorized to delete this ad" });
    }

    await sql`DELETE FROM ads WHERE id = ${id}`;

    return { success: true };
  } catch (error) {
    console.error("Delete ad error:", error);
    throw error;
  }
});