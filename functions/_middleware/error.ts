import { HTTPException } from 'hono/http-exception';
import type { Context, Next } from 'hono';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(err: Error, c: Context): Response {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status as any);
  }

  if (err instanceof AppError) {
    return c.json({ error: err.message }, err.statusCode);
  }

  console.error('Unhandled error:', err);

  return c.json({ error: 'Internal server error' }, 500);
}

export async function errorMiddleware(c: Context, next: Next): Promise<void> {
  try {
    await next();
  } catch (err) {
    const response = errorHandler(err as Error, c);
    c.res = response;
  }
}