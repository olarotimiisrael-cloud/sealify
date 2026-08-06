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

    const { notificationId, readAll } = body;

    if (readAll) {
      await sql`
        UPDATE notifications SET read = true WHERE user_id = ${user.id} AND read = false
      `;
      return { success: true, updated: 'all' };
    }

    if (!notificationId) {
      throw createError({ statusCode: 400, statusMessage: "notificationId required" });
    }

    const result = await sql`
      UPDATE notifications SET read = true WHERE id = ${notificationId} AND user_id = ${user.id} RETURNING *
    `;

    if (result.length === 0) {
      throw createError({ statusCode: 404, statusMessage: "Notification not found" });
    }

    return { notification: result[0] };
  } catch (error) {
    console.error("Mark notification read error:", error);
    throw error;
  }
});