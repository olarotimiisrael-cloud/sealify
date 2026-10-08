import { Hono } from 'hono';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { askSealifyCopilot } from '../lib/ai/assistant';
import { getActiveProvider, type SupportedAIProvider } from '../lib/ai/providers';
import { requireBasicAuth, checkFeatureAccess } from '../middleware/authCheck';
import { FEATURE_TIERS, isFeatureAvailable } from '../lib/features';
import { auditLog } from '../middleware/security';
import { getSql } from '../db/hyperdrive';
// import { v4 as uuidv4 } from 'uuid';

const REQUEST_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const MAX_MESSAGE_CHARS = 1600;
const MAX_CONVERSATION_CHARS = 12000;
const RATE_LIMIT_BUCKETS = new Map<string, { count: number; windowStart: number }>();

const copilotSchema = z.object({
  message: z.string().min(1).max(MAX_MESSAGE_CHARS),
  conversation: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(8000),
    })
  ).max(12).default([]),
  context: z.object({
    marketplaceContext: z.enum(['buyer', 'seller', 'admin', 'none']).default('none'),
    productId: z.string().optional(),
    conversationId: z.string().default(() => {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0].toString(36);
    }),
    language: z.enum(['en', 'ha', 'yo', 'ig']).default('en'), // Nigerian languages
  }).optional(),
});

const getRateLimitKey = (c: any) => {
  return c.req.header('CF-Connecting-IP') || c.req.header('x-real-ip') || c.req.header('x-forwarded-for') || 'local-user';
};

const enforceRateLimit = (c: any, provider?: SupportedAIProvider) => {
  if (provider === 'sealify') return true;
  
  const key = getRateLimitKey(c);
  const now = Date.now();
  const bucket = RATE_LIMIT_BUCKETS.get(key);

  if (!bucket || now - bucket.windowStart > REQUEST_LIMIT_WINDOW_MS) {
    RATE_LIMIT_BUCKETS.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  bucket.count += 1;
  return true;
};

const getUserContext = async (env: any, authHeader?: string): Promise<{
  authenticated: boolean;
  userId: string;
  fullName: string;
  role: string;
  verified: boolean;
  listingCount: number;
  savedListingCount: number;
  unreadMessageCount: number;
  notificationCount: number;
} | undefined> => {
  if (!authHeader?.startsWith('Bearer ')) return undefined;

  try {
    const token = authHeader.replace('Bearer ', '').trim();
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return undefined;

    return {
      authenticated: true,
      userId: user.id,
      fullName: user.user_metadata?.full_name || user.email || 'Sealify user',
      role: 'buyer',
      verified: false,
      listingCount: 0,
      savedListingCount: 0,
      unreadMessageCount: 0,
      notificationCount: 0,
    };
  } catch {
    return undefined;
  }
};

export const copilotRoutes = new Hono<{ Bindings: any }>();

// Apply basic auth middleware to all routes (allows tracking of authenticated users)
copilotRoutes.use('*', requireBasicAuth);

   copilotRoutes.get('/health', (c) => {
   const env = c.env as any;
   const provider = env.AI_PROVIDER || 'none';

   return c.json({
     ok: true,
     provider,
     configured: Boolean(provider === 'sealify' ? (env.AI_LOCAL_BASE_URL || env.SEALIFY_MODEL_BASE_URL || env.AI_CONFIG || env.COPILOT_AI_CONFIG || env.SECRET_AI_CONFIG || env.OPENAI_API_KEY || env.GEMINI_API_KEY) : (env.AI_PROVIDER && (env.OPENAI_API_KEY || env.GEMINI_API_KEY))),
     webSearchEnabled: env.AI_WEB_SEARCH_ENABLED !== 'false',
     features: {
       basic: FEATURE_TIERS.BASIC,
       premium: FEATURE_TIERS.PREMIUM
     }
   });
 });

copilotRoutes.post('/', async (c) => {
  try {
    const env = c.env as any;

    const provider = getActiveProvider(env);

    if (!provider) {
      return c.json({
        message: 'Sealify Copilot is not configured yet. Add the required AI provider credentials in the server environment.',
        citations: [],
        provider: 'none',
      }, 503);
    }

    if (!enforceRateLimit(c, provider.provider)) {
      return c.json({
        message: "⏳ **Rate Limit Reached** — You've sent too many requests to Sealify Copilot. Please wait a moment and try again. This limit helps maintain quality service for all users.",
        citations: [],
        provider: 'none',
      }, 429);
    }

    const body = await c.req.json();
    const parsed = copilotSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.errors.map(e => e.message).join(', ');
      return c.json({
        message: `⚠️ **Request Could Not Be Processed** — ${issues}. Please check your input and try again.`,
        citations: [],
        provider: 'none',
      }, 400);
    }

      const authHeader = c.req.header('Authorization');
      const userContext = await getUserContext(env, authHeader);
      
      // Check if user has access to AI copilot feature
      if (!isFeatureAvailable('ai-chat-basic', userContext !== undefined) && !isFeatureAvailable('ai-chat-advanced', userContext !== undefined)) {
         await auditLog(
           getSql(c.env), 
           userContext?.userId ?? 'anonymous', 
           'Feature Access Denied', 
           `User attempted to access AI copilot without proper permissions`, 
           'security'
         );
        
        return c.json({ 
          error: 'Feature not available',
          message: userContext !== undefined 
            ? 'This feature requires a premium subscription' 
            : 'Please log in to access this feature',
          redirect: userContext !== undefined ? '/upgrade' : '/login'
        }, 403);
     }

     const { message, conversation, context } = parsed.data;
     
     // Set default context if not provided
     const finalContext = context || {
        marketplaceContext: 'none',
        productId: undefined,
        conversationId: () => {
          const array = new Uint32Array(1);
          crypto.getRandomValues(array);
          return array[0].toString(36);
        },
        language: 'en'
      };

    const conversationUsed = conversation.reduce((total, item) => total + item.content.length, 0);
    if (conversationUsed > MAX_CONVERSATION_CHARS) {
      return c.json({
        message: `📝 **Conversation Too Long** — The total conversation length exceeds the maximum allowed (${MAX_CONVERSATION_CHARS} characters). Please start a new conversation to continue.`,
        citations: [],
        provider: 'none',
      }, 400);
    }

    const response = await askSealifyCopilot(message, conversation as { role: 'user' | 'assistant'; content: string }[], userContext, env as Record<string, string | undefined>);

    // Detect if the AI model returned an error about unsupported image input
    // This can happen when a non-vision model is asked to process an image
    const imageErrorPatterns = [
      'cannot read',
      'does not support image input',
      'image input',
      'vision',
      'image.png',
    ];
    const responseText = response.text.toLowerCase();
    const isImageError = imageErrorPatterns.some((pattern) => responseText.includes(pattern));

    if (isImageError) {
      return c.json({
        message: `⚠️ **AI Vision Not Available** — The current AI model (${response.provider}: ${response.model}) doesn't support image analysis. Please switch to a vision-capable model (e.g., GPT-4o, Gemini 2.5 Pro, or Sealify Vision) in Admin → AI & Copilot settings, or describe the image in text instead.`,
        citations: [],
        usedWebSearch: false,
        provider: response.provider,
        model: response.model,
      }, 400);
    }

    return c.json({
      message: response.text,
      citations: response.citations || [],
      usedWebSearch: !!response.usedWebSearch,
      provider: response.provider,
      model: response.model,
    });
  } catch (error) {
    console.error('Copilot request failed', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return c.json({
      message: `⚠️ **Copilot Temporarily Unavailable** — ${errMsg.includes('not configured') ? 'The AI provider is not configured yet. Please contact an administrator.' : errMsg.includes('rate') || errMsg.includes('429') ? 'Rate limit exceeded. Please try again shortly.' : 'An unexpected error occurred. Please try again or contact support.'}`,
      citations: [],
      provider: 'none',
    }, 503);
  }
});

export default copilotRoutes;