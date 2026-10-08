import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { auditLog } from '../middleware/security';
import { getSql } from '../db/hyperdrive';

/**
 * Middleware to require authentication for premium AI generation features
 * Allows unauthenticated access to basic features only
 */
export const requireAuth = async (c: any, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');
  const path = c.req.path;
  
  // Define paths that require authentication (premium features)
  const premiumPaths = [
    '/api/generate',
    '/api/image/',
    '/api/video/',
    '/api/ai/advanced',
    '/api/upscale',
    '/api/edit/pro'
  ];
  
  // Check if this path requires authentication
  const requiresAuth = premiumPaths.some(prefix => path.startsWith(prefix));
  
  if (!requiresAuth) {
    // For non-premium paths, continue without auth check
    await next();
    return;
  }

  // Check for authentication token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    await auditLog(
      getSql(c.env), 
      'anonymous', 
      'Unauthorized Access Attempt', 
      `Attempted to access premium feature without auth: ${path}`, 
      'security'
    );
    
    return c.json({ 
      error: 'Authentication required for this feature',
      message: 'Please log in to access advanced AI generation features',
      redirect: '/login'
    }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      await auditLog(
        getSql(c.env), 
        'unknown', 
        'Invalid Token Attempt', 
        `Attempted to use invalid token for: ${path}`, 
        'security'
      );
      
      return c.json({ 
        error: 'Invalid authentication token',
        message: 'Your session may have expired. Please log in again.',
        redirect: '/login'
      }, 401);
    }

    // Attach user info to context for downstream use
    c.set('user', user);
    
    // Log successful authentication for premium feature access
     await auditLog(
       getSql(c.env), 
       user.id, 
       'Premium Feature Access', 
       `Authenticated user accessing: ${path}`, 
       'user'
     );
    
  } catch (error) {
    await auditLog(
      getSql(c.env), 
      'unknown', 
      'Authentication Error', 
      `Error during auth check for ${path}: ${error.message}`, 
      'security'
    );
    
    return c.json({ 
      error: 'Authentication failed',
      message: 'Unable to verify your credentials. Please try again.'
    }, 500);
  }
  
  await next();
};

/**
 * Middleware for basic features - allows both authenticated and unauthenticated users
 * Attaches user info if available for tracking purposes
 */
export const requireBasicAuth = async (c: any, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');
  
  // Try to get user info if token is provided
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        c.set('user', user);
        
        // Log basic feature usage by authenticated users
        await auditLog(
           getSql(c.env), 
           user.id, 
           'Basic Feature Access', 
           `Authenticated user using basic feature: ${c.req.path}`, 
           'user'
         );
      }
    } catch (error) {
      // Continue without user context - don't block basic feature access
      console.warn('Failed to attach user context:', error.message);
    }
  }
  
  await next();
};

/**
 * Middleware to verify user has access to specific feature based on auth status
 */
export const checkFeatureAccess = (feature: string) => {
  return async (c: any, next: () => Promise<void>) => {
    const user = c.get('user');
    
    // Import feature definitions (we'll create this next)
    const { isFeatureAvailable, FEATURE_TIERS } = await import('../lib/features');
    
    if (!isFeatureAvailable(feature, user)) {
      const userStatus = user ? 'authenticated' : 'unauthenticated';
      
      await auditLog(
        getSql(c.env), 
        user?.id || 'anonymous', 
        'Feature Access Denied', 
        `${userStatus} user attempted to access ${feature}`, 
        'security'
      );
      
      return c.json({ 
        error: 'Feature not available',
        message: user 
          ? 'This feature requires a premium subscription' 
          : 'Please log in to access this feature',
        redirect: user ? '/upgrade' : '/login'
      }, 403);
    }
    
    await next();
  };
}