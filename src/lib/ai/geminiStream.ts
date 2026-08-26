import { GoogleGenAI, type Content } from '@google/genai';
import { needsWebSearch } from './providers';

export type Citation = {
  title: string;
  url: string;
  source?: string;
};

export type StreamResult = {
  text: string;
  citations: Citation[];
  usedWebSearch: boolean;
  model: string;
};

export type StreamCallbacks = {
  onToken: (token: string) => void;
  onCitations: (citations: Citation[]) => void;
  onDone: (result: StreamResult) => void;
  onError: (error: Error) => void;
};

export async function streamGeminiResponse(
  input: string,
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string,
  apiKey: string,
  model: string = 'gemini-2.5-flash',
  callbacks?: StreamCallbacks,
): Promise<StreamResult> {
  const ai = new GoogleGenAI({ apiKey });
  const useWebSearch = needsWebSearch(input);

  const history: Content[] = [];
  for (const msg of conversation) {
    history.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  const config: Record<string, unknown> = {
    systemInstruction: systemPrompt,
    temperature: 0.7,
    maxOutputTokens: 2048,
  };

  if (useWebSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const result: StreamResult = {
    text: '',
    citations: [],
    usedWebSearch: useWebSearch,
    model,
  };

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents: [
        ...history,
        {
          role: 'user',
          parts: [{ text: input }],
        },
      ],
    });

    let groundChunks: Array<{ web?: { title?: string; uri?: string } }> = [];

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        result.text += text;
        callbacks?.onToken(text);
      }

      const groundingMetadata = (chunk as any).groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        groundChunks = groundingMetadata.groundingChunks;
      }
    }

    if (groundChunks.length > 0) {
      result.citations = groundChunks
        .filter((chunk) => chunk.web?.uri)
        .map((chunk) => ({
          title: chunk.web?.title || chunk.web?.uri || 'Source',
          url: chunk.web?.uri || '#',
          source: chunk.web?.uri ? new URL(chunk.web.uri).hostname : 'Source',
        }));
      callbacks?.onCitations(result.citations);
    }

    callbacks?.onDone(result);
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Gemini streaming failed');
    callbacks?.onError(err);
    throw err;
  }
}
