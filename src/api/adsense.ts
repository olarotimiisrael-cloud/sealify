import { Hono } from 'hono';
import { z } from 'zod';
import { getSql } from '../db/hyperdrive';

const adsenseConfigSchema = z.object({
  enabled: z.boolean().default(false),
  clientId: z.string().trim().max(200).default('ca-pub-1826576243729056'),
  autoAdsEnabled: z.boolean().default(false),
  homeSlot: z.string().trim().max(200).default(''),
  listingsSlot: z.string().trim().max(200).default(''),
  listingsSidebarSlot: z.string().trim().max(200).default(''),
  listingDetailSlot: z.string().trim().max(200).default(''),
}).strict();

const DEFAULT_ADSENSE_CONFIG = {
  enabled: false,
  clientId: 'ca-pub-1826576243729056',
  autoAdsEnabled: false,
  homeSlot: '',
  listingsSlot: '',
  listingsSidebarSlot: '',
  listingDetailSlot: '',
};

const loadAdSenseConfig = async (sql: ReturnType<typeof getSql>) => {
  const rows = await sql`SELECT value FROM system_configs WHERE key = 'adsense_config' LIMIT 1`;
  const stored = rows[0]?.value;
  if (!stored || typeof stored !== 'object') return { ...DEFAULT_ADSENSE_CONFIG };
  const parsed = adsenseConfigSchema.safeParse(stored);
  return parsed.success ? parsed.data : { ...DEFAULT_ADSENSE_CONFIG };
};

export const adsenseRoutes = new Hono<{ Bindings: any }>();

adsenseRoutes.get('/config', async (c) => {
  const sql = getSql(c.env);
  const config = await loadAdSenseConfig(sql);
  return c.json({ success: true, config });
});

export default adsenseRoutes;
