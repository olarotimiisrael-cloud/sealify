import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport, type WebStandardStreamableHTTPServerTransportOptions } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { askSealifyCopilot, type CopilotUserContext } from '../lib/ai/assistant.js';
import { getActiveProvider } from '../lib/ai/providers.js';

let mcpServer: McpServer | null = null;
let transport: WebStandardStreamableHTTPServerTransport | null = null;

export interface SealifyMcpContext {
  env: Record<string, string | undefined>;
  ai?: any;
  userContext?: CopilotUserContext;
}

function getServer(): McpServer {
  if (!mcpServer) {
    mcpServer = new McpServer({
      name: 'sealify-copilot',
      version: '1.0.0',
      capabilities: {
        tools: { listChanged: true },
      },
      instructions: 'Sealify Copilot - AI assistant for the Sealify marketplace platform. Use tools to search the web, generate images, and access various Sealify functions.',
    });

    registerTools(mcpServer);
  }
  return mcpServer;
}

function registerTools(server: McpServer): void {
  server.registerTool(
    'sealify_web_search',
    {
      description: 'Search the web for current information. Useful for recent news, market prices, regulations, and up-to-date data.',
      inputSchema: z.object({
        query: z.string().min(1).max(500).describe('Search query'),
        language: z.string().optional().default('en').describe('Language code (en, ha, yo, ig)'),
      }),
      outputSchema: z.object({
        results: z.array(z.object({
          title: z.string(),
          url: z.string(),
          snippet: z.string(),
        })),
      }),
    },
    async (args: { query: string; language?: string }) => {
      const env = process.env as Record<string, string | undefined>;
      const provider = getActiveProvider(env);
      
      if (!provider) {
        return createToolError('No AI provider configured. Please contact your administrator.');
      }

      const searchQuery = `Search the web for: "${args.query}". Provide the top 5 relevant results with their titles, URLs, and brief descriptions.`;
      
      try {
        const response = await askSealifyCopilot(
          searchQuery,
          [],
          undefined,
          env,
          provider.provider === 'cloudflare-ai' ? undefined : env
        );

        const results = extractSearchResults(response.text);
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ results }, null, 2),
          }],
          structuredContent: { results },
          isError: false,
        };
      } catch (error) {
        return createToolError(error instanceof Error ? error.message : String(error));
      }
    },
  );

  server.registerTool(
    'sealify_generate_image',
    {
      description: 'Generate an image from a text prompt. Supports various styles and resolutions.',
      inputSchema: z.object({
        prompt: z.string().min(1).max(1000).describe('Image description'),
        width: z.number().int().min(64).max(2048).optional().default(1024).describe('Image width in pixels'),
        height: z.number().int().min(64).max(2048).optional().default(1024).describe('Image height in pixels'),
        numImages: z.number().int().min(1).max(4).optional().default(1).describe('Number of images to generate'),
        format: z.enum(['png', 'jpeg', 'webp']).optional().default('png').describe('Image format'),
        quality: z.enum(['standard', 'hd']).optional().default('standard').describe('Image quality'),
      }),
      outputSchema: z.object({
        images: z.array(z.object({
          base64: z.string(),
          revisedPrompt: z.string().optional(),
          seed: z.number().optional(),
        })),
      }),
    },
    async (args: {
      prompt: string;
      width?: number;
      height?: number;
      numImages?: number;
      format?: 'png' | 'jpeg' | 'webp';
      quality?: 'standard' | 'hd';
    }) => {
      const { generateImage } = await import('../lib/ai/generation.js');
      
      try {
        const result = await generateImage({
          prompt: args.prompt,
          width: args.width || 1024,
          height: args.height || 1024,
          numImages: args.numImages || 1,
          format: args.format,
          quality: args.quality,
        }, process.env as Record<string, string | undefined>);

        const images = result.images.map(img => ({
          base64: img.base64,
          revisedPrompt: img.revisedPrompt,
          seed: img.seed,
        }));

        return {
          content: [{
            type: 'text',
            text: `Generated ${images.length} image(s)` + (images[0]?.revisedPrompt ? `\nRevised prompt: ${images[0].revisedPrompt}` : ''),
          }],
          structuredContent: { images },
          isError: false,
        };
      } catch (error) {
        return createToolError(error instanceof Error ? error.message : String(error));
      }
    },
  );

  server.registerTool(
    'sealify_copilot_query',
    {
      description: 'Ask the Sealify Copilot a question with optional conversation context.',
      inputSchema: z.object({
        message: z.string().min(1).max(8000).describe('User message'),
        conversation: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional().default([]).describe('Previous conversation'),
        context: z.object({
          marketplaceContext: z.enum(['buyer', 'seller', 'admin', 'none']).optional().default('none').describe('User role in marketplace'),
          productId: z.string().optional().describe('Product context ID'),
          language: z.string().optional().default('en').describe('Response language'),
        }).optional(),
      }),
      outputSchema: z.object({
        text: z.string(),
        citations: z.array(z.object({
          title: z.string(),
          url: z.string(),
        })).optional(),
        usedWebSearch: z.boolean(),
        provider: z.string(),
        model: z.string(),
      }),
    },
    async (args: {
      message: string;
      conversation?: Array<{ role: 'user' | 'assistant'; content: string }>;
      context?: {
        marketplaceContext?: 'buyer' | 'seller' | 'admin' | 'none';
        productId?: string;
        language?: string;
      };
    }) => {
      try {
        const userContext: CopilotUserContext | undefined = args.context ? {
          ...args.context,
          conversationId: crypto.getRandomValues(new Uint32Array(1))[0].toString(36),
        } : undefined;

        const response = await askSealifyCopilot(
          args.message,
          args.conversation || [],
          userContext,
          process.env as Record<string, string | undefined>,
          (process.env as any).AI
        );

        return {
          content: [{
            type: 'text',
            text: response.text,
          }],
          structuredContent: {
            text: response.text,
            citations: response.citations?.map(c => ({ title: c.title, url: c.url })),
            usedWebSearch: response.usedWebSearch,
            provider: response.provider,
            model: response.model,
          },
          isError: false,
        };
      } catch (error) {
        return createToolError(error instanceof Error ? error.message : String(error));
      }
    },
  );

  server.registerTool(
    'sealify_marketplace_info',
    {
      description: 'Get information about the Sealify marketplace (products, pricing, features).',
      inputSchema: z.object({
        query: z.string().min(1).max(500).describe('Information request'),
      }),
    },
    async (args: { query: string }) => {
      try {
        const response = await askSealifyCopilot(
          `You are Sealify Marketplace Assistant. Provide information about: ${args.query}. Include relevant details about products, pricing, and features.`,
          [],
          undefined,
          process.env as Record<string, string | undefined>,
          (process.env as any).AI
        );

        return {
          content: [{
            type: 'text',
            text: response.text,
          }],
          isError: false,
        };
      } catch (error) {
        return createToolError(error instanceof Error ? error.message : String(error));
      }
    },
  );
}

function extractSearchResults(text: string): { title: string; url: string; snippet: string }[] {
  const results: { title: string; url: string; snippet: string }[] = [];
  
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  for (const line of lines) {
    const urlMatch = line.match(/https?:\/\/[^\s\])]+/);
    if (urlMatch) {
      const url = urlMatch[0].replace(/[)\]>\n\r\t ]+$/, '');
      const snippet = line.replace(/https?:\/\/[^\s\])]+/, '').trim();
      const title = snippet.split('—')[0].split(':').slice(0, 2).join(':').trim() || 'Search result';
      
      results.push({ title, url, snippet: snippet.length > 200 ? snippet.substring(0, 200) + '...' : snippet });
    }
  }
  
  if (results.length === 0) {
    results.push({
      title: 'Web Search Response',
      url: '#',
      snippet: text,
    });
  }
  
  return results.slice(0, 5);
}

function createToolError(message: string): CallToolResult {
  return {
    content: [{
      type: 'text',
      text: `Error: ${message}`,
    }],
    isError: true,
  };
}

export function getMcpServer(): McpServer {
  return getServer();
}

export function createMcpTransport(options?: WebStandardStreamableHTTPServerTransportOptions): WebStandardStreamableHTTPServerTransport {
  transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    enableJsonResponse: true,
    ...options,
  });
  
  transport.onclose = () => {
    transport = null;
    mcpServer = null;
  };
  
  return transport;
}

export async function handleMcpRequest(req: Request): Promise<Response | undefined> {
  let activeTransport = transport;
  
  if (isInitializeRequest(req)) {
    if (!activeTransport) {
      activeTransport = createMcpTransport();
    }
  }
  
  if (!activeTransport) {
    return undefined;
  }
  
  return activeTransport.handleRequest(req);
}

function isInitializeRequest(req: Request): boolean {
  const method = req.method;
  const protocolVersion = req.headers.get('mcp-protocol-version');
  
  return method === 'POST' || method === 'GET' || !!protocolVersion;
}