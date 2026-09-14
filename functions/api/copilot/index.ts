import { Hono } from 'hono';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getSql } from '../../_middleware/db';
import type { AppContext } from '../../_middleware/types';

const REQUEST_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const MAX_MESSAGE_CHARS = 2000;
const MAX_CONVERSATION_CHARS = 15000;
const RATE_LIMIT_BUCKETS = new Map<string, { count: number; windowStart: number }>();

const copilotSchema = z.object({
  message: z.string().min(1).max(MAX_MESSAGE_CHARS),
  conversation: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(8000),
    })
  ).max(12).default([]),
  stream: z.boolean().default(false),
});

const getRateLimitKey = (c: any) => {
  return c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'local-user';
};

const enforceRateLimit = (c: any, provider?: SupportedAIProvider): boolean => {
  if (provider === 'sealify') return true;
  
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

type SupportedAIProvider = 'openai' | 'gemini' | 'sealify';

interface AIProvider {
  provider: SupportedAIProvider;
  apiKey?: string;
  model: string;
  baseUrl?: string;
  webSearchEnabled: boolean;
  fallbackEnabled: boolean;
}

type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: Array<{ id: string; type: 'function'; function: ToolFunctionCall }>;
  tool_call_id?: string;
};

type ToolFunctionCall = {
  name: string;
  arguments: string;
};

type ToolCall = {
  id: string;
  type: 'function';
  function: ToolFunctionCall;
};

function getActiveProvider(env: Record<string, string | undefined>): AIProvider | null {
  const rawProviderName = (env.AI_PROVIDER || 'sealify').toLowerCase();
  const providerName = rawProviderName === 'local' ? 'sealify' : rawProviderName === 'openai' || rawProviderName === 'gemini' || rawProviderName === 'sealify' ? rawProviderName : 'sealify';

  if (providerName === 'sealify') {
    return {
      provider: 'sealify',
      model: env.SEALIFY_MODEL || 'sealify-mini',
      baseUrl: env.SEALIFY_MODEL_BASE_URL || env.AI_LOCAL_BASE_URL || 'http://localhost:11434',
      webSearchEnabled: env.AI_WEB_SEARCH_ENABLED !== 'false',
      fallbackEnabled: env.AI_FALLBACK_ENABLED !== 'false',
    };
  }

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

// Function definitions for AI to call
const FUNCTIONS = [
  {
    name: 'search_listings',
    description: 'Search for active listings on Sealify marketplace',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        category: { type: 'string', description: 'Category filter' },
        maxPrice: { type: 'number', description: 'Maximum price in NGN' },
        minPrice: { type: 'number', description: 'Minimum price in NGN' },
        location: { type: 'string', description: 'Location filter' },
        condition: { type: 'string', description: 'Condition filter' },
        limit: { type: 'number', description: 'Number of results', default: 5 },
      },
      required: [],
    },
  },
  {
    name: 'get_categories',
    description: 'Get all active categories with subcategories',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'get_user_context',
    description: 'Get current user profile and activity context',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'get_safe_meetup_spots',
    description: 'Get verified safe meetup locations in Ogbomoso',
    parameters: { type: 'object', properties: {} },
  },
];

async function callOpenAI(
  messages: ChatMessage[],
  model: string,
  apiKey: string,
  useWebSearch: boolean,
  enableFunctions: boolean = true,
) {
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 1500,
  };

  if (enableFunctions) {
    body.tools = FUNCTIONS.map(f => ({ type: 'function', function: f }));
    body.tool_choice = 'auto';
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
  const choice = payload.choices?.[0];
  const message = choice?.message;
  const content = message?.content || 'I could not generate a response.';

  const citations = ((payload as any).citations || []).map((item: any) => ({
    title: item.title || item.url || 'Source',
    url: item.url || '#',
    source: item.url ? new URL(item.url).hostname : 'Source',
  }));

  return {
    text: content,
    citations: citations.length ? citations : undefined,
    // Chat Completions does not support the Responses API web-search tool.
    // Keep this endpoint reliable; Gemini retains its native grounding support.
    usedWebSearch: false,
    toolCall: message?.tool_calls?.[0] as ToolCall | undefined,
    provider: 'openai' as const,
    model,
  };
}

async function callGemini(
  messages: ChatMessage[],
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
      maxOutputTokens: 1500,
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

async function callSealifyLocal(
  messages: ChatMessage[],
  model: string,
  baseUrl: string,
) {
  const url = `${baseUrl.replace(/\/$/, '')}/api/chat`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: { temperature: 0.7 },
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: { message: 'Sealify model request failed' } }));
    throw new Error(payload?.error?.message || 'Sealify model request failed');
  }

  const payload = await response.json();
  const content = payload.message?.content || 'I could not generate a response.';

  return {
    text: content,
    citations: [],
    usedWebSearch: false,
    provider: 'sealify' as const,
    model,
  };
}

// Execute function calls
async function executeFunctionCall(functionCall: ToolFunctionCall, env: AppContext['Bindings'], userId?: string) {
  const { name, arguments: args } = functionCall;

  try {
    const parsedArgs = JSON.parse(args || '{}') as Record<string, unknown>;
    switch (name) {
      case 'search_listings': {
        const sql = getSql(env);
        let whereClause = 'WHERE a.status = \'active\'';
        const params: any[] = [];
        let paramIndex = 1;

        if (typeof parsedArgs.query === 'string' && parsedArgs.query) {
          whereClause += ` AND (a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex} OR a.category_id ILIKE $${paramIndex})`;
          params.push(`%${parsedArgs.query}%`);
          paramIndex++;
        }
        if (typeof parsedArgs.category === 'string' && parsedArgs.category) {
          whereClause += ` AND a.category_id = $${paramIndex}`;
          params.push(parsedArgs.category);
          paramIndex++;
        }
        if (typeof parsedArgs.minPrice === 'number' && Number.isFinite(parsedArgs.minPrice)) {
          whereClause += ` AND a.price >= $${paramIndex}`;
          params.push(parsedArgs.minPrice);
          paramIndex++;
        }
        if (typeof parsedArgs.maxPrice === 'number' && Number.isFinite(parsedArgs.maxPrice)) {
          whereClause += ` AND a.price <= $${paramIndex}`;
          params.push(parsedArgs.maxPrice);
          paramIndex++;
        }
        if (typeof parsedArgs.location === 'string' && parsedArgs.location) {
          whereClause += ` AND a.location ILIKE $${paramIndex}`;
          params.push(`%${parsedArgs.location}%`);
          paramIndex++;
        }
        if (typeof parsedArgs.condition === 'string' && parsedArgs.condition) {
          whereClause += ` AND a.condition = $${paramIndex}`;
          params.push(parsedArgs.condition);
          paramIndex++;
        }

        const requestedLimit = typeof parsedArgs.limit === 'number' ? parsedArgs.limit : 5;
        const limit = Math.max(1, Math.min(Math.floor(requestedLimit), 10));
        params.push(limit);
        const listings = await sql.unsafe(`
          SELECT a.id, a.title, a.description, a.price, a.category_id, a.condition, a.location, a.images, a.created_at,
                 p.full_name as seller_name, p.verified as seller_verified
          FROM ads a
          LEFT JOIN profiles p ON a.seller_id = p.id
          ${whereClause}
          ORDER BY a.created_at DESC
          LIMIT $${paramIndex}
        `, params);
        return { success: true, data: listings };
      }
      case 'get_categories': {
        const sql = getSql(env);
        const categories = await sql`SELECT * FROM categories WHERE is_active = true ORDER BY sort_order`;
        const subcategories = await sql`SELECT * FROM subcategories WHERE is_active = true ORDER BY sort_order`;
        const result = categories.map((cat: any) => ({
          ...cat,
          subcategories: subcategories.filter((sub: any) => sub.category_id === cat.id),
        }));
        return { success: true, data: result };
      }
      case 'get_user_context': {
        if (!userId) return { success: false, error: 'User not authenticated' };
        const sql = getSql(env);
        const [profile, listingsCount, savedCount, unreadMessages, notifications] = await Promise.all([
          sql`SELECT * FROM profiles WHERE id = ${userId}`,
          sql`SELECT COUNT(*) as count FROM ads WHERE seller_id = ${userId} AND status = 'active'`,
          sql`SELECT COUNT(*) as count FROM favorites WHERE user_id = ${userId}`,
          sql`SELECT COUNT(*) as count FROM messages WHERE receiver_id = ${userId} AND read = false`,
          sql`SELECT COUNT(*) as count FROM notifications WHERE user_id = ${userId} AND read = false`,
        ]);
        return {
          success: true,
          data: {
            profile: profile[0] || null,
            listingCount: parseInt(listingsCount[0]?.count || '0'),
            savedListingCount: parseInt(savedCount[0]?.count || '0'),
            unreadMessageCount: parseInt(unreadMessages[0]?.count || '0'),
            notificationCount: parseInt(notifications[0]?.count || '0'),
          },
        };
      }
      case 'get_safe_meetup_spots': {
        const sql = getSql(env);
        const spots = await sql`SELECT * FROM safe_meetup_spots WHERE is_active = true ORDER BY sort_order`;
        return { success: true, data: spots };
      }
      default:
        return { success: false, error: `Unknown function: ${name}` };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Function execution failed' };
  }
}

function buildSealifySystemPrompt(userContext?: any): string {
  const basePrompt = `You are Sealify Copilot, an AI assistant for Sealify Nigeria — a trusted marketplace for Ogbomoso and surrounding areas. You help users with:

**Marketplace Assistance:**
- Finding products and services on Sealify (use search_listings function)
- Pricing guidance for listings based on category and condition
- Writing effective, compelling ad descriptions
- Safety tips for in-person transactions
- Platform features and how to use them
- Category and subcategory navigation

**General Assistance:**
- General knowledge questions
- Web-grounded research when needed (prices, trends, news)
- Technology explanations
- Nigerian/Ogbomoso local context

**Guidelines:**
- Be helpful, concise, and friendly
- Always reference Sealify features when relevant
- Use function calls to get real-time data from the marketplace
- If you don't know something specific to Sealify, say so honestly
- Prioritize user safety in transaction advice
- Format prices in NGN (₦)
- Mention safe meetup spots for in-person deals`;

  if (!userContext) {
    return basePrompt;
  }

  return `${basePrompt}

**Current User Context:**
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
    configured: Boolean(provider === 'sealify' || (c.env.AI_PROVIDER && (c.env.OPENAI_API_KEY || c.env.GEMINI_API_KEY))),
    webSearchEnabled: c.env.AI_WEB_SEARCH_ENABLED !== 'false',
    functionsEnabled: true,
  });
});

copilotRoutes.post('/', async (c) => {
  try {
    const provider = getActiveProvider(c.env as Record<string, string | undefined>);

    if (!provider) {
      return c.json({ message: 'Sealify Copilot is not configured yet. Add the required AI provider credentials in the server environment.', citations: [], provider: 'none' }, 503);
    }

    if (!enforceRateLimit(c, provider.provider)) {
      return c.json({ message: 'Sealify Copilot is temporarily unavailable. Please try again later.', citations: [], provider: 'none' }, 429);
    }

    const body = await c.req.json();
    const parsed = copilotSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ message: 'Invalid request format.', citations: [], provider: 'none' }, 400);
    }

    const authHeader = c.req.header('authorization');
    let userContext: any = undefined;
    let userId: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '').trim();
        const supabase = createClient(c.env.SUPABASE_URL || '', c.env.SUPABASE_ANON_KEY || '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
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

    // Fetch user context if authenticated
    if (userId) {
      try {
        const sql = getSql(c.env);
        const [profile, listingsCount, savedCount, unreadMessages, notifications] = await Promise.all([
          sql`SELECT * FROM profiles WHERE id = ${userId}`,
          sql`SELECT COUNT(*) as count FROM ads WHERE seller_id = ${userId} AND status = 'active'`,
          sql`SELECT COUNT(*) as count FROM favorites WHERE user_id = ${userId}`,
          sql`SELECT COUNT(*) as count FROM messages WHERE receiver_id = ${userId} AND read = false`,
          sql`SELECT COUNT(*) as count FROM notifications WHERE user_id = ${userId} AND read = false`,
        ]);
        if (profile[0]) {
          userContext = {
            ...userContext,
            fullName: profile[0].full_name,
            role: profile[0].role,
            verified: profile[0].verified,
            listingCount: parseInt(listingsCount[0]?.count || '0'),
            savedListingCount: parseInt(savedCount[0]?.count || '0'),
            unreadMessageCount: parseInt(unreadMessages[0]?.count || '0'),
            notificationCount: parseInt(notifications[0]?.count || '0'),
          };
        }
      } catch {
        // Ignore context fetch errors
      }
    }

    const { message, conversation } = parsed.data;
    const conversationUsed = conversation.reduce((total, item) => total + item.content.length, 0);
    if (conversationUsed > MAX_CONVERSATION_CHARS) {
      return c.json({ message: 'Conversation too long. Please start a new chat.', citations: [], provider: 'none' }, 400);
    }

    const messages = [
      { role: 'system' as const, content: buildSealifySystemPrompt(userContext) },
      ...conversation.map((item) => ({ role: item.role, content: item.content })),
      { role: 'user' as const, content: message },
    ];

    const useWebSearch = needsWebSearch(message) && provider.webSearchEnabled;
    const enableFunctions = provider.provider === 'openai';

    async function processWithProvider(prov: AIProvider) {
      let response;
      if (prov.provider === 'sealify') {
        response = await callSealifyLocal(messages, prov.model, prov.baseUrl || 'http://localhost:11434');
      } else if (prov.provider === 'openai') {
        response = await callOpenAI(messages, prov.model, prov.apiKey || '', useWebSearch, enableFunctions);
      } else {
        response = await callGemini(messages, prov.model, prov.apiKey || '', useWebSearch);
      }

      // Handle function calls
      if (response.toolCall) {
        const functionResult = await executeFunctionCall(response.toolCall.function, c.env, userId);

        // Follow the Chat Completions tool-call protocol: tool calls have an ID,
        // and their results are returned with role "tool" and that same ID.
        const followUpMessages: ChatMessage[] = [
          ...messages,
          {
            role: 'assistant',
            content: response.text || '',
            tool_calls: [response.toolCall],
          },
          {
            role: 'tool',
            tool_call_id: response.toolCall.id,
            content: JSON.stringify(functionResult),
          },
        ];
        
        let finalResponse;
        if (prov.provider === 'sealify') {
          finalResponse = await callSealifyLocal(followUpMessages, prov.model, prov.baseUrl || 'http://localhost:11434');
        } else if (prov.provider === 'openai') {
          finalResponse = await callOpenAI(followUpMessages, prov.model, prov.apiKey || '', useWebSearch, false);
        } else {
          finalResponse = await callGemini(followUpMessages, prov.model, prov.apiKey || '', useWebSearch);
        }
        
        return {
          ...finalResponse,
          functionCalled: response.toolCall.function.name,
          functionResult: functionResult.success ? functionResult.data : undefined,
        };
      }

      return response;
    }

    try {
      const response = await processWithProvider(provider);

      return c.json({
        message: response.text,
        citations: response.citations || [],
        usedWebSearch: !!response.usedWebSearch,
        functionCalled: response.functionCalled,
        functionResult: response.functionResult,
        provider: response.provider,
        model: response.model,
      });
    } catch (error) {
      console.error('Copilot request failed', error);
      const errorMessage = error instanceof Error ? error.message : 'AI request failed';

      if (provider.fallbackEnabled) {
        const fallback = getActiveProvider({
          ...c.env,
          AI_PROVIDER: provider.provider === 'openai' ? 'gemini' : provider.provider === 'gemini' ? 'openai' : 'sealify',
        } as Record<string, string | undefined>);

        if (fallback && fallback.provider !== provider.provider) {
          const fallbackMessages = [
            { role: 'system' as const, content: buildSealifySystemPrompt(userContext) },
            ...conversation.map((item) => ({ role: item.role, content: item.content })),
            { role: 'user' as const, content: message },
          ];

          try {
            let fallbackResponse;
            if (fallback.provider === 'sealify') {
              fallbackResponse = await callSealifyLocal(fallbackMessages, fallback.model, fallback.baseUrl || 'http://localhost:11434');
            } else if (fallback.provider === 'openai') {
              fallbackResponse = await callOpenAI(fallbackMessages, fallback.model, fallback.apiKey || '', useWebSearch, enableFunctions);
            } else {
              fallbackResponse = await callGemini(fallbackMessages, fallback.model, fallback.apiKey || '', useWebSearch);
            }
            return c.json({
              message: fallbackResponse.text,
              citations: fallbackResponse.citations || [],
              usedWebSearch: !!fallbackResponse.usedWebSearch,
              provider: fallbackResponse.provider,
              model: fallbackResponse.model,
              fallback: true,
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
