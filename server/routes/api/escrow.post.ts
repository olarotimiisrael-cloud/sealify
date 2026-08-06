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

    const { ad_id, amount, inspection_location } = body;

    if (!ad_id || !amount) {
      throw createError({ statusCode: 400, statusMessage: "ad_id and amount required" });
    }

    // Get ad details
    const ad = await sql`SELECT * FROM ads WHERE id = ${ad_id}`;
    if (ad.length === 0) {
      throw createError({ statusCode: 404, statusMessage: "Ad not found" });
    }
    if (ad[0].seller_id === user.id) {
      throw createError({ statusCode: 400, statusMessage: "Cannot escrow your own ad" });
    }
    if (ad[0].status !== 'active') {
      throw createError({ statusCode: 400, statusMessage: "Ad is not active" });
    }

    // Check if escrow already exists
    const existing = await sql`
      SELECT * FROM escrow_orders WHERE ad_id = ${ad_id} AND buyer_id = ${user.id} AND status IN ('created', 'funded', 'inspection')
    `;
    if (existing.length > 0) {
      throw createError({ statusCode: 400, statusMessage: "Escrow already exists for this ad" });
    }

    // Generate handover code
    const handoverCode = `ESC-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`SEALIFY_ESCROW:${ad_id}:${handoverCode}:${amount}`)}&color=059669&bgcolor=020617`;

    // Create escrow order
    const result = await sql`
      INSERT INTO escrow_orders (ad_id, buyer_id, seller_id, amount, status, handover_code, qr_code_url, inspection_location, created_at, updated_at)
      VALUES (${ad_id}, ${user.id}, ${ad[0].seller_id}, ${amount}, 'created', ${handoverCode}, ${qrCodeUrl}, ${inspection_location || null}, NOW(), NOW())
      RETURNING *
    `;

    // Notify seller
    await sql`
      INSERT INTO notifications (user_id, type, title, description, link_url, created_at)
      VALUES (${ad[0].seller_id}, 'escrow', 'New Escrow Request', 'Buyer wants to use escrow for ' || ${ad[0].title}, '/messages', NOW())
    `;

    // Hold funds from buyer wallet (simulate)
    await sql`
      INSERT INTO transactions (wallet_id, type, amount, status, description, reference, created_at)
      SELECT id, 'escrow_hold', -${amount}, 'pending', 'Escrow hold for ' || ${ad[0].title}, ${result[0].id}, NOW()
      FROM wallets WHERE user_id = ${user.id}
    `;

    return { escrow: result[0] };
  } catch (error) {
    console.error("Create escrow error:", error);
    throw error;
  }
});