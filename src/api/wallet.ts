import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const walletRoutes = new Hono();

walletRoutes.get("/", async (c) => {
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

    const wallet = await sql`SELECT * FROM wallets WHERE user_id = ${user.id}`;

    if (wallet.length === 0) {
      // Create wallet if doesn't exist
      const newWallet = await sql`
        INSERT INTO wallets (user_id, balance, pending_balance, total_withdrawn, currency, updated_at)
        VALUES (${user.id}, 0, 0, 0, 'NGN', NOW())
        RETURNING *
      `;
      return c.json({ wallet: newWallet[0] });
    }

    return c.json({ wallet: wallet[0] });
  } catch (error) {
    console.error("Get wallet error:", error);
    return c.json({ error: "Failed to fetch wallet" }, 500);
  }
});

walletRoutes.get("/transactions", async (c) => {
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
    const { limit = "50", offset = "0", type } = c.req.query();

    let whereClause = "WHERE w.user_id = $1";
    const params: any[] = [user.id];
    let paramIndex = 2;

    if (type) {
      whereClause += ` AND t.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offsetNum = parseInt(offset) || 0;

    const transactions = await sql`
      SELECT t.*, a.title as ad_title
      FROM transactions t
      LEFT JOIN ads a ON t.related_ad_id = a.id
      JOIN wallets w ON t.wallet_id = w.id
      ${sql(whereClause)}
      ORDER BY t.created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    return c.json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    return c.json({ error: "Failed to fetch transactions" }, 500);
  }
});

walletRoutes.post("/payout", async (c) => {
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
    const { amount } = body;

    if (!amount || amount < 1000) {
      return c.json({ error: "Minimum payout is ₦1,000" }, 400);
    }

    const sql = getSql(env);

    const wallet = await sql`SELECT * FROM wallets WHERE user_id = ${user.id}`;
    if (wallet.length === 0 || wallet[0].balance < amount) {
      return c.json({ error: "Insufficient balance" }, 400);
    }

    // Create payout transaction
    await sql`
      INSERT INTO transactions (wallet_id, type, amount, status, description, created_at)
      VALUES (${wallet[0].id}, 'payout', -${amount}, 'pending', 'Withdrawal to bank', NOW())
    `;

    // Update wallet balance
    await sql`
      UPDATE wallets SET balance = balance - ${amount}, pending_balance = pending_balance + ${amount}, updated_at = NOW() WHERE user_id = ${user.id}
    `;

    // Notify user
    await sql`
      INSERT INTO notifications (user_id, type, title, description, link_url, created_at)
      VALUES (${user.id}, 'payment', 'Payout Requested', 'Your withdrawal of ₦${amount.toLocaleString()} is being processed', '/wallet', NOW())
    `;

    return c.json({ success: true, message: "Payout request submitted" });
  } catch (error) {
    console.error("Payout error:", error);
    return c.json({ error: "Failed to process payout" }, 500);
  }
});

walletRoutes.get("/payouts", async (c) => {
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

    const payouts = await sql`
      SELECT * FROM transactions
      WHERE wallet_id = (SELECT id FROM wallets WHERE user_id = ${user.id})
      AND type = 'payout'
      ORDER BY created_at DESC
    `;

    return c.json({ payouts });
  } catch (error) {
    console.error("Get payouts error:", error);
    return c.json({ error: "Failed to fetch payouts" }, 500);
  }
});