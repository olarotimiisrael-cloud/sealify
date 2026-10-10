export type SupportedAIProvider = 'openai' | 'gemini' | 'sealify' | 'cloudflare-ai';

export interface ProviderConfig {
  provider: SupportedAIProvider;
  enabled: boolean;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  webSearchEnabled: boolean;
  fallbackEnabled: boolean;
  maxRequestLength?: number;
  perUserRateLimit?: number;
  dailyRequestLimit?: number;
  // New vision/image generation capabilities
  visionEnabled?: boolean;
  visionModel?: string;
  imageGenerationEnabled?: boolean;
  imageGenerationModel?: string;
  videoGenerationEnabled?: boolean;
  videoGenerationModel?: string;
}

export interface AdminAiSettings {
  provider: SupportedAIProvider;
  enabled: boolean;
  model: string;
  apiKey: string;
  baseUrl?: string;
  webSearchEnabled: boolean;
  maxRequestLength: number;
  perUserRateLimit: number;
  dailyRequestLimit: number;
  // New vision/image generation settings
  visionEnabled: boolean;
  visionModel: string;
  imageGenerationEnabled: boolean;
  imageGenerationModel: string;
  videoGenerationEnabled: boolean;
  videoGenerationModel: string;
}

export interface VisionCapability {
  supported: boolean;
  maxImageSize?: number; // MB
  supportedFormats?: string[];
  maxImagesPerRequest?: number;
}

export interface ImageGenerationCapability {
  supported: boolean;
  maxResolution?: string;
  supportedSizes?: string[];
  supportedFormats?: string[];
  maxImagesPerRequest?: number;
}

export interface VideoGenerationCapability {
  supported: boolean;
  maxDuration?: number; // seconds
  supportedResolutions?: string[];
  supportedFormats?: string[];
}

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const DEFAULT_SEALIFY_MODEL = 'sealify-mini';
const DEFAULT_SEALIFY_URL = 'http://localhost:11434';
const AI_CONFIG_STORE_KEY = '__sealify_ai_runtime_config__';

// Model capabilities registry
export const MODEL_CAPABILITIES: Record<string, {
  vision?: VisionCapability;
  imageGeneration?: ImageGenerationCapability;
  videoGeneration?: VideoGenerationCapability;
}> = {
  'gpt-4o': {
    vision: { supported: true, maxImageSize: 20, supportedFormats: ['png', 'jpeg', 'webp', 'gif'], maxImagesPerRequest: 10 },
    imageGeneration: { supported: false }, // Use DALL-E 3 separately
  },
  'gpt-4o-mini': {
    vision: { supported: true, maxImageSize: 20, supportedFormats: ['png', 'jpeg', 'webp', 'gif'], maxImagesPerRequest: 10 },
    imageGeneration: { supported: false },
  },
  'gpt-4.1-mini': {
    vision: { supported: true, maxImageSize: 20, supportedFormats: ['png', 'jpeg', 'webp', 'gif'], maxImagesPerRequest: 10 },
    imageGeneration: { supported: false },
  },
  'gpt-4-turbo': {
    vision: { supported: true, maxImageSize: 20, supportedFormats: ['png', 'jpeg', 'webp', 'gif'], maxImagesPerRequest: 10 },
    imageGeneration: { supported: false },
  },
  'gemini-2.5-pro': {
    vision: { supported: true, maxImageSize: 20, supportedFormats: ['png', 'jpeg', 'webp', 'gif', 'heic'], maxImagesPerRequest: 16 },
    imageGeneration: { supported: false }, // Use Imagen separately
    videoGeneration: { supported: false }, // Use Veo separately
  },
  'gemini-2.5-flash': {
    vision: { supported: true, maxImageSize: 20, supportedFormats: ['png', 'jpeg', 'webp', 'gif', 'heic'], maxImagesPerRequest: 16 },
    imageGeneration: { supported: false },
    videoGeneration: { supported: false },
  },
  'gemini-2.0-flash': {
    vision: { supported: true, maxImageSize: 20, supportedFormats: ['png', 'jpeg', 'webp', 'gif', 'heic'], maxImagesPerRequest: 16 },
    imageGeneration: { supported: false },
    videoGeneration: { supported: false },
  },
  'sealify-vision': {
    vision: { supported: true, maxImageSize: 20, supportedFormats: ['png', 'jpeg', 'webp', 'gif'], maxImagesPerRequest: 10 },
    imageGeneration: { supported: false },
  },
  'sealify-pro': {
    vision: { supported: false },
    imageGeneration: { supported: false },
  },
  'sealify-mini': {
    vision: { supported: false },
    imageGeneration: { supported: false },
  },
  'dall-e-3': {
    imageGeneration: { supported: true, maxResolution: '1792x1024', supportedSizes: ['1024x1024', '1792x1024', '1024x1792'], supportedFormats: ['png'], maxImagesPerRequest: 1 },
  },
  'dall-e-2': {
    imageGeneration: { supported: true, maxResolution: '1024x1024', supportedSizes: ['256x256', '512x512', '1024x1024'], supportedFormats: ['png'], maxImagesPerRequest: 10 },
  },
  'imagen-3': {
    imageGeneration: { supported: true, maxResolution: '2048x2048', supportedSizes: ['1024x1024', '2048x2048'], supportedFormats: ['png', 'jpeg'], maxImagesPerRequest: 4 },
  },
  'veo-2': {
    videoGeneration: { supported: true, maxDuration: 60, supportedResolutions: ['720p', '1080p', '4k'], supportedFormats: ['mp4'] },
  },
  'sora': {
    videoGeneration: { supported: true, maxDuration: 60, supportedResolutions: ['720p', '1080p'], supportedFormats: ['mp4'] },
  },
};

const modelOptions: Record<SupportedAIProvider, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
  openai: ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4o'],
  sealify: ['sealify-mini', 'sealify-pro', 'sealify-vision'],
  'cloudflare-ai': ['@cf/meta/llama-3.2-11b-instruct', '@cf/meta/llama-3.3b-instruct', '@cf/meta/llama-3.1-8b-instruct', '@cf/google/gemma-2b-it', '@cf/google/gemma-7b-it', '@cf/meta/llama-3.2-11b-vision-instruct'],
};

export const IMAGE_GENERATION_MODELS = ['dall-e-3', 'dall-e-2', 'imagen-3', 'stable-diffusion-xl', 'stable-diffusion-3'];
export const VIDEO_GENERATION_MODELS = ['veo-2', 'veo-3', 'sora', 'runway-gen3', 'pika', 'luma-dream-machine'];

export function maskSecret(secret?: string) {
  const value = (secret || '').trim();
  if (!value) return '';
  if (value.length <= 4) return '••••';
  return `••••••••••••••••••••${value.slice(-4)}`;
}

export function getRuntimeAiConfig(): Partial<AdminAiSettings> | null {
  if (typeof globalThis === 'undefined') return null;
  const maybe = (globalThis as any)[AI_CONFIG_STORE_KEY];
  return maybe || null;
}

export function setRuntimeAiConfig(config: Partial<AdminAiSettings> | null) {
  if (typeof globalThis === 'undefined') return;
  (globalThis as any)[AI_CONFIG_STORE_KEY] = config || null;
}

export function isModelSupported(provider: SupportedAIProvider, model: string) {
  const normalizedModel = (model || '').trim();
  if (!normalizedModel) return false;
  return modelOptions[provider].includes(normalizedModel) || normalizedModel.startsWith('gemini-') || normalizedModel.startsWith('gpt-') || IMAGE_GENERATION_MODELS.includes(normalizedModel) || VIDEO_GENERATION_MODELS.includes(normalizedModel);
}

export function getModelCapabilities(model: string) {
  return MODEL_CAPABILITIES[model] || {};
}

export function supportsVision(model: string): boolean {
  return MODEL_CAPABILITIES[model]?.vision?.supported === true;
}

export function supportsImageGeneration(model: string): boolean {
  return MODEL_CAPABILITIES[model]?.imageGeneration?.supported === true;
}

export function supportsVideoGeneration(model: string): boolean {
  return MODEL_CAPABILITIES[model]?.videoGeneration?.supported === true;
}

export function resolveAiConfig(env: Record<string, string | undefined>): Partial<AdminAiSettings> {
  const runtimeConfig = getRuntimeAiConfig();
  const envConfigJson = env.AI_CONFIG || env.COPILOT_AI_CONFIG || env.SECRET_AI_CONFIG;
  const parsedJson = envConfigJson ? (() => { try { return JSON.parse(envConfigJson); } catch { return null; } })() : null;
  const base = parsedJson || runtimeConfig || {};

const rawProvider = ((base.provider || env.AI_PROVIDER || 'sealify') as string).toLowerCase();
    const provider = rawProvider === 'local' ? 'sealify' : rawProvider === 'openai' || rawProvider === 'gemini' || rawProvider === 'sealify' || rawProvider === 'cloudflare-ai' ? rawProvider : 'sealify';
  const apiKey = (base.apiKey || env.GEMINI_API_KEY || env.OPENAI_API_KEY || '').trim();
  const customBaseUrl = (base.baseUrl || env.AI_LOCAL_BASE_URL || env.SEALIFY_MODEL_BASE_URL || '').trim();
  const sealifyBaseUrl = customBaseUrl || DEFAULT_SEALIFY_URL;
  const model = (base.model || (provider === 'openai' ? env.OPENAI_MODEL : provider === 'gemini' ? env.GEMINI_MODEL : env.SEALIFY_MODEL || env.AI_LOCAL_MODEL) || (provider === 'openai' ? DEFAULT_OPENAI_MODEL : provider === 'gemini' ? DEFAULT_GEMINI_MODEL : DEFAULT_SEALIFY_MODEL)).trim();

  const visionModel = (base.visionModel || env.AI_VISION_MODEL || (provider === 'openai' ? 'gpt-4o' : provider === 'gemini' ? 'gemini-2.5-pro' : provider === 'cloudflare-ai' ? '@cf/meta/llama-3.2-11b-vision-instruct' : 'sealify-vision')).trim();
  const imageGenerationModel = (base.imageGenerationModel || env.AI_IMAGE_GENERATION_MODEL || (provider === 'openai' ? 'dall-e-3' : provider === 'gemini' ? 'imagen-3' : provider === 'cloudflare-ai' ? '@cf/stabilityai/stable-diffusion-xl-base-1.0' : 'stable-diffusion-xl')).trim();
  const videoGenerationModel = (base.videoGenerationModel || env.AI_VIDEO_GENERATION_MODEL || 'veo-2').trim();

  const sealifyEnabled = provider === 'sealify' && (customBaseUrl || Boolean(apiKey));
  const cloudflareAiEnabled = provider === 'cloudflare-ai';

  return {
    provider,
    enabled: base.enabled !== false && (sealifyEnabled || cloudflareAiEnabled || Boolean(apiKey)),
    model,
    apiKey,
    baseUrl: sealifyBaseUrl,
    webSearchEnabled: base.webSearchEnabled ?? env.AI_WEB_SEARCH_ENABLED !== 'false',
    maxRequestLength: Number(base.maxRequestLength ?? env.AI_MAX_REQUEST_LENGTH ?? 1600),
    perUserRateLimit: Number(base.perUserRateLimit ?? env.AI_PER_USER_RATE_LIMIT ?? 10),
    dailyRequestLimit: Number(base.dailyRequestLimit ?? env.AI_DAILY_LIMIT ?? 500),
    visionEnabled: base.visionEnabled ?? env.AI_VISION_ENABLED !== 'false',
    visionModel,
    imageGenerationEnabled: base.imageGenerationEnabled ?? env.AI_IMAGE_GENERATION_ENABLED !== 'false',
    imageGenerationModel,
    videoGenerationEnabled: base.videoGenerationEnabled ?? env.AI_VIDEO_GENERATION_ENABLED !== 'false',
    videoGenerationModel,
  };
}

export function getProviderConfig(env: Record<string, string | undefined>): ProviderConfig[] {
  const config = resolveAiConfig(env);
  const provider = config.provider || 'sealify';
  const providers: ProviderConfig[] = [];

  if (provider === 'sealify') {
    const sealifyBaseUrl = config.baseUrl || DEFAULT_SEALIFY_URL;
    providers.push({
      provider,
      enabled: config.enabled && (Boolean(config.baseUrl && config.baseUrl !== DEFAULT_SEALIFY_URL) || Boolean(config.apiKey)),
      model: config.model || DEFAULT_SEALIFY_MODEL,
      baseUrl: sealifyBaseUrl,
      apiKey: config.apiKey,
      webSearchEnabled: config.webSearchEnabled !== false,
      fallbackEnabled: env.AI_FALLBACK_ENABLED === 'true',
      maxRequestLength: Number(config.maxRequestLength || 1600),
      perUserRateLimit: Number(config.perUserRateLimit || 10),
      dailyRequestLimit: Number(config.dailyRequestLimit || 500),
      visionEnabled: config.visionEnabled,
      visionModel: config.visionModel,
      imageGenerationEnabled: config.imageGenerationEnabled,
      imageGenerationModel: config.imageGenerationModel,
      videoGenerationEnabled: config.videoGenerationEnabled,
      videoGenerationModel: config.videoGenerationModel,
    });
  }

if (provider === 'cloudflare-ai') {
    providers.push({
      provider: 'cloudflare-ai',
      enabled: config.enabled,
      model: config.model || '@cf/meta/llama-3.2-11b-instruct',
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      webSearchEnabled: config.webSearchEnabled !== false,
      fallbackEnabled: env.AI_FALLBACK_ENABLED === 'true',
      maxRequestLength: Number(config.maxRequestLength || 1600),
      perUserRateLimit: Number(config.perUserRateLimit || 10),
      dailyRequestLimit: Number(config.dailyRequestLimit || 500),
      visionEnabled: config.visionEnabled,
      visionModel: config.visionModel || '@cf/meta/llama-3.2-11b-vision-instruct',
      imageGenerationEnabled: config.imageGenerationEnabled,
      imageGenerationModel: config.imageGenerationModel || '@cf/stabilityai/stable-diffusion-xl-base-1.0',
      videoGenerationEnabled: config.videoGenerationEnabled,
      videoGenerationModel: config.videoGenerationModel,
    });
  }

  if (provider === 'openai' || provider === 'gemini') {
    providers.push({
      provider,
      enabled: config.enabled !== false && Boolean(config.apiKey),
      model: config.model || (provider === 'openai' ? DEFAULT_OPENAI_MODEL : DEFAULT_GEMINI_MODEL),
      apiKey: config.apiKey,
      webSearchEnabled: config.webSearchEnabled !== false,
      fallbackEnabled: env.AI_FALLBACK_ENABLED === 'true',
      maxRequestLength: Number(config.maxRequestLength || 1600),
      perUserRateLimit: Number(config.perUserRateLimit || 10),
      dailyRequestLimit: Number(config.dailyRequestLimit || 500),
      visionEnabled: config.visionEnabled,
      visionModel: config.visionModel,
      imageGenerationEnabled: config.imageGenerationEnabled,
      imageGenerationModel: config.imageGenerationModel,
      videoGenerationEnabled: config.videoGenerationEnabled,
      videoGenerationModel: config.videoGenerationModel,
    });
  }

  const fallbackProvider = provider === 'openai' ? 'gemini' : provider === 'gemini' ? 'openai' : 'openai';
  const fallbackKey = fallbackProvider === 'openai' ? env.OPENAI_API_KEY : env.GEMINI_API_KEY;
  const hasFallback = env.AI_FALLBACK_ENABLED === 'true' && fallbackKey;

  if (hasFallback) {
    providers.push({
      provider: fallbackProvider,
      enabled: true,
      model: fallbackProvider === 'openai' ? env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL : env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
      apiKey: fallbackKey,
      webSearchEnabled: env.AI_WEB_SEARCH_ENABLED !== 'false',
      fallbackEnabled: false,
      maxRequestLength: Number(env.AI_MAX_REQUEST_LENGTH || 1600),
      perUserRateLimit: Number(env.AI_PER_USER_RATE_LIMIT || 10),
      dailyRequestLimit: Number(env.AI_DAILY_LIMIT || 500),
      visionEnabled: env.AI_VISION_ENABLED !== 'false',
      visionModel: fallbackProvider === 'openai' ? 'gpt-4o' : 'gemini-2.5-pro',
      imageGenerationEnabled: env.AI_IMAGE_GENERATION_ENABLED !== 'false',
      imageGenerationModel: fallbackProvider === 'openai' ? 'dall-e-3' : 'imagen-3',
      videoGenerationEnabled: env.AI_VIDEO_GENERATION_ENABLED !== 'false',
      videoGenerationModel: 'veo-2',
    });
  }

  return providers.filter((item) => item.enabled);
}

export function getActiveProvider(env: Record<string, string | undefined>) {
  const providerConfig = getProviderConfig(env);
  return providerConfig[0] || null;
}

export function needsWebSearch(message: string) {
  const normalized = message.toLowerCase();
  const triggers = [
    'latest', 'today', 'current', 'news', 'what is happening', 'current price', 'latest price',
    'who is the current', 'search the web', 'latest regulation', 'recent', 'this week', 'this month',
    'today in nigeria', 'current information', 'what happened', 'latest update', 'latest news',
  ];

  return triggers.some((trigger) => normalized.includes(trigger));
}