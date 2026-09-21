import { HTTPException } from 'hono/http-exception';
import type { Context, Next } from 'hono';
import type { AppContext } from './types';
import { getSupabase } from './supabase';
import { getSql } from './db';
import { auditLog } from './admin-service';

export interface AuthUser {
  id: string;
  email: string;
}

export async function requireAuth(c: Context<AppContext>, next: Next): Promise<void> {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Authorization header required' });
    }

    const token = authHeader.substring(7);
    const supabase = getSupabase(c.env);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new HTTPException(401, { message: 'Invalid or expired token' });
    }

    c.set('user', {
      id: user.id,
      email: user.email || '',
    });

    await next();
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err;
    }
    throw new HTTPException(401, { message: 'Authentication failed' });
  }
}

export async function requireAdmin(c: Context<AppContext>, next: Next): Promise<void> {
  try {
    const user = c.get('user');
    if (!user) {
      throw new HTTPException(401, { message: 'Authentication required' });
    }

    const sql = getSql(c.env);

    const result = await sql`
      SELECT public.is_admin(${user.id}) AS is_admin
    `;

    if (!result[0]?.is_admin) {
      throw new HTTPException(403, { message: 'Administrator access required' });
    }

    await next();
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err;
    }
    throw new HTTPException(403, { message: 'Administrator authorization failed' });
  }
}

export async function getCurrentUser(c: Context<AppContext>): Promise<AuthUser | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const supabase = getSupabase(c.env);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || '',
  };
}