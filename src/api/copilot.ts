import { Hono } from 'hono';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { askSealifyCopilot } from '../lib/ai/assistant';

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
});

const getRateLimitKey = (c: any) => {
  return c.req.header('CF-Connecting-IP') || c.req.header('x-real-ip') || c.req.header('x-forwarded-for') || 'local-user';
};

const enforceRateLimit = (c: any) => {
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

const getUserContext = async (env: any, authHeader?: string) => {
  if (!authHeader?.startsWith('Bearer ')) return undefined;

  try {
    const token = authHeader.replace('Bearer ', '').trim();
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
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

copilotRoutes.get('/health', (c) => {
  const env = c.env as any;
  const provider = env.AI_PROVIDER || 'none';

  return c.json({
    ok: true,
    provider,
    configured: Boolean(env.AI_PROVIDER && (env.OPENAI_API_KEY || env.GEMINI_API_KEY)),
    webSearchEnabled: env.AI_WEB_SEARCH_ENABLED !== 'false',
  });
});

copilotRoutes.post('/', async (c) => {
  try {
    const env = c.env as any;

    if (!enforceRateLimit(c)) {
      return c.json({
        message: 'Sealify Copilot is temporarily unavailable. Please try again later.',
        citations: [],
        provider: 'none',
      }, 429);
    }

    const body = await c.req.json();
    const parsed = copilotSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({
        message: 'Sealify Copilot is temporarily unavailable. Please try again later.',
        citations: [],
        provider: 'none',
      }, 400);
    }

    const authHeader = c.req.header('Authorization');
    const userContext = await getUserContext(env, authHeader);
    const { message, conversation } = parsed.data;

    const conversationUsed = conversation.reduce((total, item) => total + item.content.length, 0);
    if (conversationUsed > MAX_CONVERSATION_CHARS) {
      return c.json({
        message: 'Sealify Copilot is temporarily unavailable. Please try again later.',
        citations: [],
        provider: 'none',
      }, 400);
    }

    const response = await askSealifyCopilot(message, conversation as { role: 'user' | 'assistant'; content: string }[], userContext, env as Record<string, string | undefined>);

    return c.json({
      message: response.text,
      citations: response.citations || [],
      usedWebSearch: !!response.usedWebSearch,
      provider: response.provider,
      model: response.model,
    });
  } catch (error) {
    console.error('Copilot request failed', error);
    return c.json({
      message: 'Sealify Copilot is temporarily unavailable. Please try again later.',
      citations: [],
      provider: 'none',
    }, 200);
  }
});
