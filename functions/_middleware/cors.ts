import type { Context, Next } from 'hono';
import type { Env } from './types';

export function corsMiddleware(c: Context<{ Bindings: Env }>, next: Next): Promise<void> {
  const isProduction = c.env.NODE_ENV === 'production';
  const allowedOrigins = (isProduction
    ? 'https://sealify.ng,https://www.sealify.ng,https://sealify.pages.dev'
    : 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173'
  ).split(',').map(o => o.trim()).filter(Boolean);

  const origin = c.req.header('Origin');
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  return next();
}