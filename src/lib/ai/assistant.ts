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

export async function askSealifyCopilot(
  input: string,
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>,
  userContext?: CopilotUserContext,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): Promise<CopilotResponse> {
  const provider = getActiveProvider(env);

  if (!provider) {
    throw new Error('No AI provider is configured. Set AI_PROVIDER and the provider key in the server environment.');
  }

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: buildSealifySystemPrompt(userContext) },
    ...conversation.map((item) => ({ role: item.role, content: item.content })),
    { role: 'user', content: input },
  ];

  const useWebSearch = needsWebSearch(input) && provider.webSearchEnabled;

  try {
    if (provider.provider === 'openai') {
      if (!provider.apiKey) throw new Error('OpenAI API key missing');
      return await callOpenAI(messages, provider.model, provider.apiKey, useWebSearch);
    }

    if (!provider.apiKey) throw new Error('Gemini API key missing');
    return await callGemini(messages, provider.model, provider.apiKey, useWebSearch);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI request failed';
    if (provider.fallbackEnabled) {
      const fallback = getActiveProvider({
        ...env,
        AI_PROVIDER: provider.provider === 'openai' ? 'gemini' : 'openai',
      });

      if (fallback && fallback.apiKey && fallback.provider !== provider.provider) {
        const fallbackMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
          { role: 'system', content: buildSealifySystemPrompt(userContext) },
          ...conversation.map((item) => ({ role: item.role, content: item.content })),
          { role: 'user', content: input },
        ];

        try {
          if (fallback.provider === 'openai') {
            return await callOpenAI(fallbackMessages, fallback.model, fallback.apiKey, useWebSearch);
          }
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
