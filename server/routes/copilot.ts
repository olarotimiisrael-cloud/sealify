import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { askSealifyCopilot } from '../../src/lib/ai/assistant.js';

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

const getRateLimitKey = (req: Request) => {
  return req.ip || req.headers['x-real-ip'] as string || req.headers['x-forwarded-for'] as string || 'local-user';
};

const enforceRateLimit = (req: Request): boolean => {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const bucket = RATE_LIMIT_BUCKETS.get(key);

  if (!bucket || now - bucket.windowStart > REQUEST_LIMIT_WINDOW_MS) {
    RATE_LIMIT_BUCKETS.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) return false;
  bucket.count++;
  return true;
};

export const copilotRouter = Router();

copilotRouter.get('/health', (req: Request, res: Response) => {
  const provider = process.env.AI_PROVIDER || 'none';
  res.json({
    ok: true,
    provider,
    configured: Boolean(process.env.AI_PROVIDER && (process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY)),
    webSearchEnabled: process.env.AI_WEB_SEARCH_ENABLED !== 'false',
  });
});

copilotRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!enforceRateLimit(req)) {
      res.status(429).json({ message: 'Sealify Copilot is temporarily unavailable. Please try again later.', citations: [], provider: 'none' });
      return;
    }

    const parsed = copilotSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Sealify Copilot is temporarily unavailable. Please try again later.', citations: [], provider: 'none' });
      return;
    }

    const authHeader = req.headers.authorization;
    let userContext: any = undefined;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '').trim();
        const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          userContext = {
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
        }
      } catch {
        // User context unavailable - continue without it
      }
    }

    const { message, conversation } = parsed.data;
    const conversationUsed = conversation.reduce((total, item) => total + item.content.length, 0);
    if (conversationUsed > MAX_CONVERSATION_CHARS) {
      res.status(400).json({ message: 'Sealify Copilot is temporarily unavailable. Please try again later.', citations: [], provider: 'none' });
      return;
    }

    const response = await askSealifyCopilot(message, conversation as { role: 'user' | 'assistant'; content: string }[], userContext, process.env as Record<string, string | undefined>);

    res.json({
      message: response.text,
      citations: response.citations || [],
      usedWebSearch: !!response.usedWebSearch,
      provider: response.provider,
      model: response.model,
    });
  } catch (error) {
    console.error('Copilot request failed', error);
    res.json({ message: 'Sealify Copilot is temporarily unavailable. Please try again later.', citations: [], provider: 'none' });
  }
});
