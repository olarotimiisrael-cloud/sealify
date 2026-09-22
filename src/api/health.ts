import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
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
	const env = c.env as any;
	const authHeader = c.req.header('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ ok: false, error: 'Unauthorized' }, 401);
	}

	const token = authHeader.substring(7);
	const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

	const { data: { user }, error: userError } = await supabase.auth.getUser(token);

	if (userError || !user) {
		return c.json({ ok: false, error: 'Unauthorized' }, 401);
	}

	let hyperdriveConfigured = true;
	let databaseCheck = false;

	try {
		const sql = getSql(env);
		const result = await sql`SELECT public.is_admin(${user.id}) AS is_admin`;
		databaseCheck = Boolean(result[0]?.is_admin);
	} catch (dbError) {
		hyperdriveConfigured = false;
		console.error('[HEALTH] Database check failed:', dbError.message);
	}

	return c.json({
		ok: hyperdriveConfigured && databaseCheck,
		supabaseConfigured: true,
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
		console.error('[HEALTH] Database check failed:', dbError.message);
		return c.json({
			ok: false,
			error: 'Database connection failed',
			message: dbError.message
		}, 503);
	}
});