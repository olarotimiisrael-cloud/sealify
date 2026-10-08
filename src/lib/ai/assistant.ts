import { buildSealifySystemPrompt, type CopilotUserContext } from './sealifyKnowledge';
import { getActiveProvider, needsWebSearch, type SupportedAIProvider } from './providers';

export type CopilotCitation = {
  title: string;
  url: string;
  source?: string;
};

export type CopilotResponse = {
  text: string;
  citations?: CopilotCitation[];
  usedWebSearch?: boolean;
  provider?: SupportedAIProvider;
  model?: string;
};


export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  transparentReason?: string;
}

const SENSITIVE_PATTERNS: { pattern: RegExp; reason: string; transparent: string }[] = [
  {
    pattern: /\b(api\s*key|secret\s*key|service\s*role|credentials?|password|token|private\s*key)\b[\s\S]{0,80}(sk-[a-zA-Z0-9-]{20,}|ya29\.)/i,
    reason: 'Sensitive credential exposure',
    transparent: 'I detected what looks like a secret credential. I cannot process or store sensitive credentials for security.',
  },
  {
    pattern: /\b(private|personal)\s+(data|information|details|phone|email|address|nin|cac)\b/i,
    reason: 'Request for private user data',
    transparent: 'I cannot share other users\' private information. This is a privacy and safety restriction.',
  },
  {
    pattern: /\b(wallet|financial\s*service|bank\s*transfer|investment|trading|forex|cryptocurrency|btc|eth|stock\s*market|loan|credit\s*score)\b/i,
    reason: 'Financial services claim',
    transparent: 'Sealify does not currently offer wallet or financial services.',
  },
];

export function moderateInput(input: string): ModerationResult {
  const trimmed = input.trim();
  if (trimmed.length < 2) return { allowed: true };

  for (const { pattern, reason, transparent } of SENSITIVE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { allowed: false, reason, transparentReason: transparent };
    }
  }

  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|prior|earlier|above)\s+(instructions?|prompts?|rules?|guidance)/i,
    /you\s+are\s+now\s+(a\s+)?(?:free|uncensored|unrestricted|jailbreak|developer|admin)/i,
    /disregard\s+your\s+(guidance|instructions|rules|constraints|policies)/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: 'Prompt injection detected',
        transparentReason: 'I noticed your request appears to be a prompt-injection attempt.',
      };
    }
  }

  return { allowed: true };
}
const safeJson = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  if (!text) {
    throw new Error('Empty response');
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Malformed AI response');
  }
};

async function callOpenAI(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  model: string,
  apiKey: string,
  useWebSearch: boolean,
): Promise<CopilotResponse> {
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
    const payload = await safeJson<{ error?: { message?: string } }>(response);
    throw new Error(payload?.error?.message || 'OpenAI request failed');
  }

  const payload = await safeJson<{ choices?: Array<{ message?: { content?: string } }>; citations?: Array<{ title?: string; url?: string }>; }>(response);
  const content = payload.choices?.[0]?.message?.content || 'I could not generate a response.';

  const citations = ((payload as any).citations || []).map((item: any) => ({
    title: item.title || item.url || 'Source',
    url: item.url || '#',
    source: new URL(item.url || '#').hostname || 'Source',
  }));

  return {
    text: content,
    citations: citations.length ? citations : undefined,
    usedWebSearch: useWebSearch,
    provider: 'openai',
    model,
  };
}

async function callGemini(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  model: string,
  apiKey: string,
  useWebSearch: boolean,
): Promise<CopilotResponse> {
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
    const payload = await safeJson<{ error?: { message?: string } }>(response);
    throw new Error(payload?.error?.message || 'Gemini request failed');
  }

  const payload = await safeJson<{ candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; groundingMetadata?: { groundingChunks?: Array<{ web?: { title?: string; uri?: string } }> } }>(response);
  const content = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || 'I could not generate a response.';

  const citations = (payload.groundingMetadata?.groundingChunks || []).map((chunk) => ({
    title: chunk.web?.title || chunk.web?.uri || 'Source',
    url: chunk.web?.uri || '#',
    source: chunk.web?.uri ? new URL(chunk.web.uri).hostname : 'Source',
  }));

  return {
    text: content,
    citations: citations.length ? citations : undefined,
    usedWebSearch: useWebSearch,
    provider: 'gemini',
    model,
  };
}

async function callLocalModel(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  model: string,
  baseUrl: string,
): Promise<CopilotResponse> {
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
    const payload = await safeJson<{ error?: { message?: string } }>(response);
    throw new Error(payload?.error?.message || 'Local model request failed');
  }

  const payload = await safeJson<{ message?: { content?: string }; done_reason?: string }>(response);
  const content = payload.message?.content || 'I could not generate a response.';

  return {
      text: content,
      citations: [],
      usedWebSearch: false,
      provider: 'sealify',
      model,
    };
}

async function callCloudflareAI(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  model: string,
  ai: any,
  useWebSearch: boolean,
): Promise<CopilotResponse> {
  if (!ai) {
    throw new Error('Cloudflare Workers AI binding not available');
  }

  const response = await ai.run(model, {
    messages: messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role,
      content: msg.content,
    })),
    stream: false,
  });

  const content = response?.response || response?.choices?.[0]?.message?.content || '';

  return {
    text: content,
    citations: [],
    usedWebSearch: useWebSearch,
    provider: 'cloudflare-ai',
    model,
  };
}

export async function askSealifyCopilot(
  input: string,
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>,
  userContext?: CopilotUserContext,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
  ai?: any, // Cloudflare AI binding instance (for Workers AI)
): Promise<CopilotResponse> {
  const provider = getActiveProvider(env);

  if (!provider) {
    throw new Error('No AI provider is configured. Set AI_PROVIDER and the provider key in the server environment.');
  }

  const moderationResult = moderateInput(input);
  if (!moderationResult.allowed) {
    return {
      text: `⚠️ **Request Restricted** — ${moderationResult.transparentReason || moderationResult.reason || 'This content is restricted.'}\n\n**Why was this blocked?** ${moderationResult.reason || 'It appears this request violates our safety guidelines.'}\n\nIf you believe this was a mistake or have questions, please rephrase your request or contact support through the app.`,
      citations: [],
      usedWebSearch: false,
      provider: provider.provider,
      model: provider.model,
    };
  }

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: buildSealifySystemPrompt(userContext) },
    ...conversation.map((item) => ({ role: item.role, content: item.content })),
    { role: 'user', content: input },
  ];

  const useWebSearch = needsWebSearch(input) && provider.webSearchEnabled;

  try {
    if (provider.provider === 'sealify') {
      return await callLocalModel(messages, provider.model, provider.baseUrl || 'http://localhost:11434');
    }

    if (provider.provider === 'cloudflare-ai') {
      return await callCloudflareAI(messages, provider.model, ai, useWebSearch);
    }

    if (provider.provider === 'openai') {
      if (!provider.apiKey) throw new Error('OpenAI API key missing');
      return await callOpenAI(messages, provider.model, provider.apiKey, useWebSearch);
    }

    if (!provider.apiKey) throw new Error('Gemini API key missing');
    return await callGemini(messages, provider.model, provider.apiKey, useWebSearch);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI request failed';
    const imageErrorPatterns = ['cannot read', 'does not support image input', 'image input', 'vision', 'image.png'];
    const isImageError = imageErrorPatterns.some((pattern) => message.toLowerCase().includes(pattern));
    if (isImageError) {
      return {
        text: `⚠️ **AI Vision Not Available** — The current AI model (${provider.provider}: ${provider.model}) doesn't support image analysis. Please switch to a vision-capable model (e.g., GPT-4o, Gemini 2.5 Pro, or Sealify Vision) in Admin → AI & Copilot settings, or describe the image in text instead.`,
        citations: [],
        usedWebSearch: false,
        provider: provider.provider,
        model: provider.model,
      };
    }
    if (provider.fallbackEnabled) {
      const fallback = getActiveProvider({
        ...env,
        AI_PROVIDER: provider.provider === 'openai' ? 'gemini' : provider.provider === 'gemini' ? 'openai' : 'openai',
      });

      if (fallback && fallback.provider !== provider.provider) {
        const fallbackMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
          { role: 'system', content: buildSealifySystemPrompt(userContext) },
          ...conversation.map((item) => ({ role: item.role, content: item.content })),
          { role: 'user', content: input },
        ];

        try {
          if (fallback.provider === 'sealify') {
            return await callLocalModel(fallbackMessages, fallback.model, fallback.baseUrl || 'http://localhost:11434');
          }
          if (fallback.provider === 'cloudflare-ai') {
            return await callCloudflareAI(fallbackMessages, fallback.model, ai, useWebSearch);
          }
          if (fallback.provider === 'openai') {
            if (!fallback.apiKey) throw new Error('OpenAI API key missing');
            return await callOpenAI(fallbackMessages, fallback.model, fallback.apiKey, useWebSearch);
          }
          if (!fallback.apiKey) throw new Error('Gemini API key missing');
          return await callGemini(fallbackMessages, fallback.model, fallback.apiKey, useWebSearch);
        } catch {
          throw new Error('Sealify Copilot is temporarily unavailable. Please try again.');
        }
      }
    }

    throw new Error(message.includes('API key') || message.includes('configured')
      ? 'Sealify Copilot is not configured yet. Add the required AI provider credentials in the server environment.'
      : 'Sealify Copilot is temporarily unavailable. Please try again.');
  }
}
