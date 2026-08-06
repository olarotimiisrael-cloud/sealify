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

    // Get escrow order
    const escrow = await sql`SELECT * FROM escrow_orders WHERE id = ${id}`;
    if (escrow.length === 0) {
      throw createError({ statusCode: 404, statusMessage: "Escrow not found" });
    }

    // Only buyer can release
    if (escrow[0].buyer_id !== user.id) {
      throw createError({ statusCode: 403, statusMessage: "Only buyer can release funds" });
    }

    if (escrow[0].status !== 'inspection') {
      throw createError({ statusCode: 400, statusMessage: "Escrow not in inspection phase" });
    }

    // Release funds
    await sql`
      UPDATE escrow_orders SET status = 'released', released_at = NOW(), updated_at = NOW() WHERE id = ${id}
    `;

    // Transfer to seller wallet
    await sql`
      INSERT INTO transactions (wallet_id, type, amount, status, description, reference, created_at)
      SELECT id, 'escrow_release', ${escrow[0].amount}, 'completed', 'Escrow release for ' || (SELECT title FROM ads WHERE id = ${escrow[0].ad_id}), ${id}, NOW()
      FROM wallets WHERE user_id = ${escrow[0].seller_id}
    `;

    // Update ad status
    await sql`UPDATE ads SET status = 'sold' WHERE id = ${escrow[0].ad_id}`;

    // Notify seller
    await sql`
      INSERT INTO notifications (user_id, type, title, description, link_url, created_at)
      VALUES (${escrow[0].seller_id}, 'payment', 'Escrow Released', 'Funds released for ' || (SELECT title FROM ads WHERE id = ${escrow[0].ad_id}), '/wallet', NOW())
    `;

    return { success: true, message: "Funds released to seller" };
  } catch (error) {
    console.error("Release escrow error:", error);
    throw error;
  }
});