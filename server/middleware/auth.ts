import type { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../db/supabase.js';
import { getSql } from '../db/postgres.js';
import { AppError } from './error-handler.js';
import { auditLog } from '../services/admin-service.js';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authorization header required', 401);
    }

    const token = authHeader.substring(7);
    const supabase = getSupabase();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Invalid or expired token', 401);
    }

    req.user = {
      id: user.id,
      email: user.email || '',
    };

    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(new AppError('Authentication failed', 401));
  }
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const sql = getSql();

    const result = await sql`
      SELECT private.is_admin(${req.user.id}) AS is_admin
    `;

    if (!result[0]?.is_admin) {
      throw new AppError('Administrator access required', 403);
    }

    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(new AppError('Administrator authorization failed', 403));
  }
}
