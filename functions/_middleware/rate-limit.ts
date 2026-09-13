import type { Context, Next } from 'hono';

interface RateLimitBucket {
  count: number;
  windowStart: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: Context) => string;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options;

  return async (c: Context, next: Next): Promise<void> => {
    const key = keyGenerator ? keyGenerator(c) : (c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'anonymous');
    const now = Date.now();
    const bucket = rateLimitBuckets.get(key);

    if (!bucket || now - bucket.windowStart > windowMs) {
      rateLimitBuckets.set(key, { count: 1, windowStart: now });
      await next();
      return;
    }

    if (bucket.count >= maxRequests) {
      throw new HTTPException(429, { message: 'Too many requests. Please try again later.' });
    }

    bucket.count++;
    await next();
  };
}

// Cleanup old buckets periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (now - bucket.windowStart > 3600000) { // 1 hour
      rateLimitBuckets.delete(key);
    }
  }
}, 300000); // Every 5 minutes