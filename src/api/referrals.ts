// referrals.ts
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";
import { requireAuth, auditLog, rateLimit } from "../middleware/security";
import { z } from "zod";

export const referralsRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql> } }>();

// Rate limiting
const referralRateLimit = rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 30 });

const referralCodeSchema = z.string().regex(/^SEALIFY-[A-Z0-9]{6}$/, "Invalid referral code format");

// Record a landing click (no auth; fire-and-forget, rate-limited)
referralsRoutes.post("/click", referralRateLimit, async (c) => {
  try {
    const sql = getSql(c.env);
    const body = await c.req.json().catch(() => ({}));
    const { code, landingPath } = body as { code?: string; landingPath?: string };
    if (!code) return c.json({ ok: false }, 400);

    await sql`
      INSERT INTO referral_clicks (code, ip_address, user_agent, landing_path, created_at)
      VALUES (${code}, ${c.req.header("CF-Connecting-IP") || null}, ${c.req.header("User-Agent") || null}, ${landingPath || null}, NOW())
    `;
    return c.json({ ok: true });
  } catch (error) {
    // Clicks are best-effort; never fail the request.
    return c.json({ ok: true });
  }
});

// Validate a referral code before signup (public)
referralsRoutes.get("/validate", async (c) => {
  try {
    const code = c.req.query("code");
    if (!code) {
      throw new HTTPException(400, { message: "code query parameter required" });
    }
    referralCodeSchema.parse(code);

    const sql = getSql(c.env);
    const rows = await sql`
      SELECT id, full_name, referral_code, referral_count
      FROM public.profiles
      WHERE referral_code = ${code}
      LIMIT 1
    `;
    if (!rows.length) {
      return c.json({ valid: false, message: "Referral code not found" });
    }
    return c.json({
      valid: true,
      referrer: {
        fullName: rows[0].full_name,
        referralCode: rows[0].referral_code,
        referralCount: rows[0].referral_count,
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: "Invalid referral code format" });
    }
    console.error("Referral validate error:", error);
    throw new HTTPException(500, { message: "Failed to validate referral code" });
  }
});

// Caller's own referral stats
referralsRoutes.get("/me", requireAuth, async (c) => {
  try {
    const env = c.env as any;
    const user = c.get("user");
    const sql = getSql(c.env);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    const thresholdRow = await sql`SELECT value->>0 AS threshold FROM system_configs WHERE key = 'referral_reward_threshold' LIMIT 1`;
    const threshold = parseInt(thresholdRow[0]?.threshold || "3", 10) || 3;

    const profile = await sql`
      SELECT referral_code, referral_count, referral_cycle
      FROM public.profiles
      WHERE id = ${user.id}
    `;

    const recent = await sql`
      SELECT r.id, r.referral_code, r.cycle, r.created_at,
             p.id AS referee_id, p.full_name AS referee_name, p.avatar_url AS referee_avatar_url
      FROM public.referrals r
      JOIN public.profiles p ON p.id = r.referee_id
      WHERE r.referrer_id = ${user.id}
      ORDER BY r.created_at DESC
      LIMIT 25
    `;

    const rewards = await sql`
      SELECT * FROM public.referral_rewards
      WHERE user_id = ${user.id}
      ORDER BY cycle ASC
    `;

    const lifetime = await sql`
      SELECT COUNT(*) AS count FROM public.referrals WHERE referrer_id = ${user.id}
    `;

    const referralCode = profile[0]?.referral_code || null;
    const referralLink = referralCode
      ? `${env.APP_URL || env.PUBLIC_SITE_URL || "https://sealify.pages.dev"}?ref=${referralCode}`
      : null;

    return c.json({
      referralCode,
      referralLink,
      referralCount: profile[0]?.referral_count || 0,
      lifetimeReferralCount: parseInt(lifetime[0]?.count || "0"),
      cycle: profile[0]?.referral_cycle || 1,
      rewardThreshold: threshold,
      progressToReward: Math.max(0, threshold - (profile[0]?.referral_count || 0)),
      nextRewardAt: threshold,
      referrals: recent.map((r: any) => ({
        id: r.id,
        refereeId: r.referee_id,
        refereeName: r.referee_name,
        refereeAvatarUrl: r.referee_avatar_url,
        cycle: r.cycle,
        createdAt: r.created_at,
      })),
      rewardHistory: rewards.map((r: any) => ({
        cycle: r.cycle,
        referralsAtReset: r.referrals_at_reset,
        grantedAt: r.created_at,
        note: r.note,
      })),
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Referral me error:", error);
    throw new HTTPException(500, { message: "Failed to get referral stats" });
  }
});

export default referralsRoutes;