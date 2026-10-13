import { Hono } from 'hono';
import { z } from 'zod';
import { askSealifyCopilot } from '../lib/ai/assistant';
import { getActiveProvider, type SupportedAIProvider } from '../lib/ai/providers';
import { requireBasicAuth, checkFeatureAccess } from '../middleware/authCheck';
import { FEATURE_TIERS, isFeatureAvailable } from '../lib/features';
import { auditLog } from '../middleware/security';
import { getSql } from '../db/hyperdrive';
import { laravelRequest } from '../lib/laravel-api';
import { laravelAuth } from '../lib/laravel-api';
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
    const laravelApiUrl = env.LARAVEL_API_URL || env.NEXT_PUBLIC_LARAVEL_API_URL || '';
    
    const response = await fetch(`${laravelApiUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return undefined;

    const data = await response.json();
    
    return {
      authenticated: true,
      userId: String(data.id || data.user_id || ''),
      fullName: data.full_name || data.name || data.email || 'Sealify user',
      role: data.role || 'buyer',
      verified: data.email_verified_at !== null,
      listingCount: data.listings_count || 0,
      savedListingCount: data.saved_listings_count || 0,
      unreadMessageCount: data.unread_messages_count || 0,
      notificationCount: data.notifications_count || 0,
    };
  } catch {
    return undefined;
  }
};

export const copilotRoutes = new Hono<{ Bindings: any }>();

// Debug test route without middleware
copilotRoutes.post('/debug-body', async (c) => {
  try {
    const rawBody = await c.req.text();
    console.log('[DEBUG] Raw body received:', rawBody);
    const body = JSON.parse(rawBody);
    return c.json({ ok: true, got: body });
  } catch (error) {
    return c.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, 400);
  }
});

// Apply basic auth middleware to all routes (allows tracking of authenticated users)
copilotRoutes.use('*', requireBasicAuth);

   copilotRoutes.get('/health', (c) => {
   const env = c.env as any;
   const provider = env.AI_PROVIDER || 'none';

   return c.json({
     ok: true,
     provider,
     configured: Boolean(provider === 'sealify' ? (env.AI_LOCAL_BASE_URL || env.SEALIFY_MODEL_BASE_URL || env.AI_CONFIG || env.COPILOT_AI_CONFIG || env.SECRET_AI_CONFIG || env.OPENAI_API_KEY || env.GEMINI_API_KEY) : provider === 'cloudflare-ai' ? true : (env.OPENAI_API_KEY || env.GEMINI_API_KEY)),
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

    const contentType = c.req.header('Content-Type');
    console.log('[COPILOT] Content-Type:', contentType);
    console.log('[COPILOT] Authorization:', c.req.header('Authorization') ? 'present' : 'missing');

    let body: any;
    try {
      body = await c.req.json();
      console.log('[COPILOT] Body parsed successfully:', JSON.stringify(body).slice(0, 200));
    } catch (parseError) {
      console.error('[COPILOT] JSON parse error:', parseError);
      const rawText = await c.req.text().catch(() => 'Unable to read body');
      console.log('[COPILOT] Raw body:', rawText.slice(0, 500));
      return c.json({
        message: `⚠️ **Request Could Not Be Processed** — Invalid JSON body: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Please check your input and try again.`,
        citations: [],
        provider: 'none',
      }, 400);
    }

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

    // Route to Laravel's native CopilotService via API - fully self-contained, no external API keys needed
    const laravelApiUrl = env.LARAVEL_API_URL || env.NEXT_PUBLIC_LARAVEL_API_URL || '';
    const authHeader = c.req.header('Authorization');
    
    try {
      const laravelResponse = await fetch(`${laravelApiUrl}/api/copilot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader || '',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation,
          marketplaceContext: finalContext.marketplaceContext || 'none',
        }),
      });

      if (!laravelResponse.ok) {
        const errorData = await laravelResponse.json().catch(() => ({}));
        return c.json({
          message: errorData?.message || '⚠️ **Copilot Temporarily Unavailable** — Unable to reach the AI service.',
          citations: [],
          provider: 'none',
        }, laravelResponse.status);
      }

      const laravelData = await laravelResponse.json();
      return c.json({
        message: laravelData.message,
        citations: laravelData.citations || [],
        usedWebSearch: laravelData.usedWebSearch || false,
        provider: laravelData.provider || 'sealify-native',
        model: laravelData.model || 'sealify-native-v1',
      });
    } catch (apiError) {
      console.error('Laravel API call failed:', apiError);
      return c.json({
        message: '⚠️ **Copilot Temporarily Unavailable** — Could not connect to the AI service. Please try again.',
        citations: [],
        provider: 'none',
      }, 503);
    }
  } catch (error) {
    console.error('Copilot request failed', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : '';
    console.error('Copilot error details', { errMsg, errStack });
    return c.json({
      message: `⚠️ **Copilot Temporarily Unavailable** — ${errMsg.includes('not configured') ? 'The AI provider is not configured yet. Please contact an administrator.' : errMsg.includes('rate') || errMsg.includes('429') ? 'Rate limit exceeded. Please try again shortly.' : 'An unexpected error occurred. Please try again or contact support.'}`,
      citations: [],
      provider: 'none',
      error: errMsg,
      stack: errStack,
    }, 503);
  }
});

copilotRoutes.post('/vision', async (c) => {
  try {
    const env = c.env as any;
    const { model, image, prompt, options } = await c.req.json();

    const isBase64 = image.startsWith('data:') || /^[A-Za-z0-9+/=]+$/.test(image);
    const imageContent = isBase64
      ? { type: 'image_url', image_url: { url: `data:image/png;base64,${image.replace(/^data:image\/[a-z]+;base64,/, '')}` } }
      : { type: 'image_url', image_url: { url: image } };

    const visionModel = env.AI_VISION_MODEL || '@cf/meta/llama-3.2-11b-vision-instruct';
    const ai = env.AI;

    if (!ai) {
      return c.json({ error: 'Vision analysis not available' }, 503);
    }

    const result = await ai.run(visionModel, {
      messages: [
        { role: 'user', content: [{ type: 'text', text: prompt }, imageContent] },
      ],
      stream: false,
    });

    const content = result?.response || '{}';

    try {
      return c.json({ analysis: JSON.parse(content) });
    } catch {
      return c.json({ analysis: { description: content } });
    }
  } catch (error) {
    console.error('Vision analysis failed', error);
    return c.json({
      error: error instanceof Error ? error.message : 'Vision analysis failed'
    }, 503);
  }
});

export default copilotRoutes;