import { Hono } from 'hono';
import type { AppContext } from '../../_middleware/types';

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

export default healthRoutes;