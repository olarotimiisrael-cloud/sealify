import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import type { AppContext } from '../../_middleware/types';

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
  return c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'local-user';
};

const enforceRateLimit = (c: any): boolean => {
  const key = getRateLimitKey(c);
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

// AI Provider types
type SupportedAIProvider = 'openai' | 'gemini';

interface AIProvider {
  provider: SupportedAIProvider;
  apiKey: string;
  model: string;
  webSearchEnabled: boolean;
  fallbackEnabled: boolean;
}

function getActiveProvider(env: Record<string, string | undefined>): AIProvider | null {
  const providerName = env.AI_PROVIDER as SupportedAIProvider;
  if (!providerName) return null;

  const apiKey = providerName === 'openai' ? env.OPENAI_API_KEY : env.GEMINI_API_KEY;
  if (!apiKey) return null;

  return {
    provider: providerName,
    apiKey,
    model: providerName === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash',
    webSearchEnabled: env.AI_WEB_SEARCH_ENABLED !== 'false',
    fallbackEnabled: env.AI_FALLBACK_ENABLED !== 'false',
  };
}

function needsWebSearch(input: string): boolean {
  const searchTriggers = [
    'latest', 'recent', 'current', 'today', 'now', 'news', 'price of', 'cost of',
    'how much', 'market rate', 'trending', 'new model', 'release date', '2024', '2025', '2026',
    'nigeria', 'ogbomoso', 'naira', 'exchange rate', 'weather', 'traffic',
  ];
  return searchTriggers.some(trigger => input.toLowerCase().includes(trigger));
}

async function callOpenAI(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  model: string,
  apiKey: string,
  useWebSearch: boolean,
) {
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 1200,
  };

  if (useWebSearch) {
    body.tools = [{ type: 'web_search_preview' }];
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: { message: 'OpenAI request failed' } }));
    throw new Error(payload?.error?.message || 'OpenAI request failed');
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content || 'I could not generate a response.';

  const citations = ((payload as any).citations || []).map((item: any) => ({
    title: item.title || item.url || 'Source',
    url: item.url || '#',
    source: item.url ? new URL(item.url).hostname : 'Source',
  }));

  return {
    text: content,
    citations: citations.length ? citations : undefined,
    usedWebSearch: useWebSearch,
    provider: 'openai' as const,
    model,
  };
}

async function callGemini(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  model: string,
  apiKey: string,
  useWebSearch: boolean,
) {
  const systemText = messages.find((message) => message.role === 'system')?.content || 'You are a helpful assistant.';
  const userText = messages.filter((message) => message.role !== 'system').map((message) => `${message.role}: ${message.content}`).join('\n\n');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: userText }] }],
    systemInstruction: { parts: [{ text: systemText }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1200,
    },
  };

  if (useWebSearch) {
    body.tools = [{ googleSearch: {} }];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: { message: 'Gemini request failed' } }));
    throw new Error(payload?.error?.message || 'Gemini request failed');
  }

  const payload = await response.json();
  const content = payload.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('') || 'I could not generate a response.';

  const citations = (payload.groundingMetadata?.groundingChunks || []).map((chunk: any) => ({
    title: chunk.web?.title || chunk.web?.uri || 'Source',
    url: chunk.web?.uri || '#',
    source: chunk.web?.uri ? new URL(chunk.web.uri).hostname : 'Source',
  }));

  return {
    text: content,
    citations: citations.length ? citations : undefined,
    usedWebSearch: useWebSearch,
    provider: 'gemini' as const,
    model,
  };
}

function buildSealifySystemPrompt(userContext?: any): string {
  const basePrompt = `You are Sealify Copilot, an AI assistant for Sealify Nigeria — a trusted marketplace for Ogbomoso and surrounding areas. You help users with:
- Finding products and services on Sealify
- Pricing guidance for listings
- Writing effective ad descriptions
- Safety tips for transactions
- Platform features and how to use them
- General questions about buying/selling in Ogbomoso

Be helpful, concise, and friendly. Reference Sealify features when relevant. If you don't know something specific to Sealify, say so honestly.`;

  if (!userContext) {
    return basePrompt;
  }

  return `${basePrompt}

Current user context:
- Authenticated: ${userContext.authenticated}
- Name: ${userContext.fullName}
- Role: ${userContext.role}
- Verified: ${userContext.verified}
- Active listings: ${userContext.listingCount}
- Saved items: ${userContext.savedListingCount}
- Unread messages: ${userContext.unreadMessageCount}
- Notifications: ${userContext.notificationCount}`;
}

export const copilotRoutes = new Hono<AppContext>();

copilotRoutes.get('/health', (c) => {
  const provider = c.env.AI_PROVIDER || 'none';
  return c.json({
    ok: true,
    provider,
    configured: Boolean(c.env.AI_PROVIDER && (c.env.OPENAI_API_KEY || c.env.GEMINI_API_KEY)),
    webSearchEnabled: c.env.AI_WEB_SEARCH_ENABLED !== 'false',
  });
});

copilotRoutes.post('/', async (c) => {
  try {
    if (!enforceRateLimit(c)) {
      return c.json({ message: 'Sealify Copilot is temporarily unavailable. Please try again later.', citations: [], provider: 'none' }, 429);
    }

    const body = await c.req.json();
    const parsed = copilotSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ message: 'Sealify Copilot is temporarily unavailable. Please try again later.', citations: [], provider: 'none' }, 400);
    }

    const authHeader = c.req.header('authorization');
    let userContext: any = undefined;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '').trim();
        const supabase = createClient(c.env.SUPABASE_URL || '', c.env.SUPABASE_ANON_KEY || '');
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
      return c.json({ message: 'Sealify Copilot is temporarily unavailable. Please try again later.', citations: [], provider: 'none' }, 400);
    }

    const provider = getActiveProvider(c.env as Record<string, string | undefined>);

    if (!provider) {
      return c.json({ message: 'Sealify Copilot is not configured yet. Add the required AI provider credentials in the server environment.', citations: [], provider: 'none' }, 503);
    }

    const messages = [
      { role: 'system' as const, content: buildSealifySystemPrompt(userContext) },
      ...conversation.map((item) => ({ role: item.role, content: item.content })),
      { role: 'user' as const, content: message },
    ];

    const useWebSearch = needsWebSearch(message) && provider.webSearchEnabled;

    try {
      let response;
      if (provider.provider === 'openai') {
        response = await callOpenAI(messages, provider.model, provider.apiKey, useWebSearch);
      } else {
        response = await callGemini(messages, provider.model, provider.apiKey, useWebSearch);
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
      const message = error instanceof Error ? error.message : 'AI request failed';

      if (provider.fallbackEnabled) {
        const fallback = getActiveProvider({
          ...c.env,
          AI_PROVIDER: provider.provider === 'openai' ? 'gemini' : 'openai',
        } as Record<string, string | undefined>);

        if (fallback && fallback.apiKey && fallback.provider !== provider.provider) {
          const fallbackMessages = [
            { role: 'system' as const, content: buildSealifySystemPrompt(userContext) },
            ...conversation.map((item) => ({ role: item.role, content: item.content })),
            { role: 'user' as const, content: message },
          ];

          try {
            let fallbackResponse;
            if (fallback.provider === 'openai') {
              fallbackResponse = await callOpenAI(fallbackMessages, fallback.model, fallback.apiKey, useWebSearch);
            } else {
              fallbackResponse = await callGemini(fallbackMessages, fallback.model, fallback.apiKey, useWebSearch);
            }
            return c.json({
              message: fallbackResponse.text,
              citations: fallbackResponse.citations || [],
              usedWebSearch: !!fallbackResponse.usedWebSearch,
              provider: fallbackResponse.provider,
              model: fallbackResponse.model,
            });
          } catch {
            return c.json({ message: 'Sealify Copilot is temporarily unavailable. Please try again.', citations: [], provider: 'none' }, 503);
          }
        }
      }

      return c.json({ message: 'Sealify Copilot is temporarily unavailable. Please try again.', citations: [], provider: 'none' }, 503);
    }
  } catch (error) {
    console.error('Copilot request failed', error);
    return c.json({ message: 'Sealify Copilot is temporarily unavailable. Please try again later.', citations: [], provider: 'none' }, 500);
  }
});

export default copilotRoutes;