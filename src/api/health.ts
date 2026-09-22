import { Hono } from 'hono';
import { getSql } from '../db/hyperdrive';
import type { AppContext } from '../middleware/types';

export const healthRoutes = new Hono<AppContext>();

healthRoutes.get('/', (c) => {
	return c.json({
		ok: true,
		service: 'sealify-api',
		version: '1.0.0',
		timestamp: new Date().toISOString(),
		runtime: 'cloudflare-pages-functions',
	});
});

healthRoutes.get('/ready', (c) => {
	return c.json({ ready: true });
});

healthRoutes.get('/live', (c) => {
	return c.json({ alive: true });
});

healthRoutes.get('/admin-auth', async (c) => {
	const env = c.env as Record<string, unknown>;

	const supabaseUrl = typeof env.SUPABASE_URL === 'string' ? env.SUPABASE_URL : '';
	const supabaseAnonKey = typeof env.SUPABASE_ANON_KEY === 'string' ? env.SUPABASE_ANON_KEY : '';
	const hyperdrive = (env.HYPERDRIVE as { connectionString?: string } | undefined) ?? undefined;

	const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
	const hyperdriveConfigured = Boolean(hyperdrive?.connectionString);

	let databaseCheck = false;
	if (hyperdriveConfigured) {
		try {
			const sql = getSql(env);
			const result = await sql`SELECT 1 as connected`;
			databaseCheck = Array.isArray(result) && result.length > 0;
		} catch (dbError) {
			console.error('[HEALTH] Database connectivity check failed:', dbError instanceof Error ? dbError.message : String(dbError));
		}
	}

	return c.json({
		ok: supabaseConfigured && hyperdriveConfigured && databaseCheck,
		supabaseConfigured,
		hyperdriveConfigured,
		databaseCheck,
	});
});

healthRoutes.get('/db', async (c) => {
	const env = c.env as any;

	try {
		const sql = getSql(env);
		// Simple query to check database connectivity
		const result = await sql`SELECT 1 as connected`;
		return c.json({
			ok: true,
			database: 'connected',
			timestamp: new Date().toISOString()
		});
	} catch (dbError) {
		console.error('[HEALTH] Database check failed:', dbError instanceof Error ? dbError.message : String(dbError));
		return c.json({
			ok: false,
			error: 'Database connection failed'
		}, 503);
	}
});