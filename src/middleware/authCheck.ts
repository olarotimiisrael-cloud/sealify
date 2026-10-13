import { auditLog } from '../middleware/security';
import { getSql } from '../db/hyperdrive';
import { laravelRequest } from '@/lib/laravel-api';

/**
 * Middleware to require authentication for premium AI generation features
 * Allows unauthenticated access to basic features only
 * FIXED: Uses Laravel API instead of Supabase to avoid consuming POST request body
 */
export const requireAuth = async (c: any, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');
  const path = c.req.path;
  
  const premiumPaths = ['/api/generate', '/api/image/', '/api/video/', '/api/ai/advanced', '/api/upscale', '/api/edit/pro'];
  const requiresAuth = premiumPaths.some(prefix => path.startsWith(prefix));
  
  if (!requiresAuth) { await next(); return; }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    await auditLog(getSql(c.env), 'anonymous', 'Unauthorized Access Attempt', Attempted to access premium feature without auth: `$path, 'security');
    return c.json({ error: 'Authentication required for this feature', message: 'Please log in to access advanced AI generation features', redirect: '/login' }, 401);
  }

  try {
    const userContext = await laravelRequest<{ user: any }>('/auth/me', { method: 'GET', auth: true });
    if (!userContext?.user) {
      await auditLog(getSql(c.env), 'unknown', 'Invalid Token Attempt', Attempted to use invalid token for: , 'security');
      return c.json({ error: 'Invalid authentication token', message: 'Your session may have expired. Please log in again.', redirect: '/login' }, 401);
    }
    c.set('user', userContext.user);
    await auditLog(getSql(c.env), userContext.user.id, 'Premium Feature Access', Authenticated user accessing: `$path, 'user');
  } catch (error) {
    await auditLog(getSql(c.env), 'unknown', 'Authentication Error', Error during auth check for `$path: , 'security');
    return c.json({ error: 'Authentication failed', message: 'Unable to verify your credentials. Please try again.' }, 500);
  }
  
  await next();
};

export const requireBasicAuth = async (c: any, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const userContext = await laravelRequest<{ user: any }>('/auth/me', { method: 'GET', auth: true });
      if (userContext?.user) {
        c.set('user', userContext.user);
        try { await auditLog(getSql(c.env), userContext.user.id, 'Basic Feature Access', Authenticated user using basic feature: `$c.req.path, 'user'); }
        catch (auditErr) { console.warn('Audit log failed:', auditErr.message); }
      } else { console.warn('Invalid authentication token'); }
    } catch (error) {
      console.warn('Failed to attach user context (continuing without):', error.message);
    }
  }
  
  await next();
};

export const checkFeatureAccess = (feature: string) => {
  return async (c: any, next: () => Promise<void>) => {
    const user = c.get('user');
    const { isFeatureAvailable } = await import('../lib/features');
    if (!isFeatureAvailable(feature, user)) {
      const userStatus = user ? 'authenticated' : 'unauthenticated';
      await auditLog(getSql(c.env), user?.id || 'anonymous', 'Feature Access Denied', ${userStatus} user attempted to access , 'security');
      return c.json({ error: 'Feature not available', message: user ? 'This feature requires a premium subscription' : 'Please log in to access this feature', redirect: user ? '/upgrade' : '/login' }, 403);
    }
    await next();
  };
};


