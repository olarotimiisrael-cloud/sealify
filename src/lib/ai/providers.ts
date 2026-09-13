export type SupportedAIProvider = 'openai' | 'gemini' | 'sealify';

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
}

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const DEFAULT_SEALIFY_MODEL = 'sealify-mini';
const DEFAULT_SEALIFY_URL = 'http://localhost:11434';
const AI_CONFIG_STORE_KEY = '__sealify_ai_runtime_config__';

const modelOptions: Record<SupportedAIProvider, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
  openai: ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4o'],
  sealify: ['sealify-mini', 'sealify-pro', 'sealify-vision'],
};

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
  return modelOptions[provider].includes(normalizedModel) || normalizedModel.startsWith('gemini-') || normalizedModel.startsWith('gpt-');
}

export function resolveAiConfig(env: Record<string, string | undefined>): Partial<AdminAiSettings> {
  const runtimeConfig = getRuntimeAiConfig();
  const envConfigJson = env.AI_CONFIG || env.COPILOT_AI_CONFIG || env.SECRET_AI_CONFIG;
  const parsedJson = envConfigJson ? (() => { try { return JSON.parse(envConfigJson); } catch { return null; } })() : null;
  const base = parsedJson || runtimeConfig || {};

  const rawProvider = ((base.provider || env.AI_PROVIDER || 'sealify') as string).toLowerCase();
  const provider = rawProvider === 'local' ? 'sealify' : rawProvider === 'openai' || rawProvider === 'gemini' || rawProvider === 'sealify' ? rawProvider : 'sealify';
  const apiKey = (base.apiKey || env.GEMINI_API_KEY || env.OPENAI_API_KEY || '').trim();
  const sealifyBaseUrl = (base.baseUrl || env.AI_LOCAL_BASE_URL || env.SEALIFY_MODEL_BASE_URL || DEFAULT_SEALIFY_URL).trim();
  const model = (base.model || (provider === 'openai' ? env.OPENAI_MODEL : provider === 'gemini' ? env.GEMINI_MODEL : env.SEALIFY_MODEL || env.AI_LOCAL_MODEL) || (provider === 'openai' ? DEFAULT_OPENAI_MODEL : provider === 'gemini' ? DEFAULT_GEMINI_MODEL : DEFAULT_SEALIFY_MODEL)).trim();

  return {
    provider,
    enabled: base.enabled !== false && (provider === 'sealify' || Boolean(apiKey)),
    model,
    apiKey,
    baseUrl: sealifyBaseUrl,
    webSearchEnabled: base.webSearchEnabled ?? env.AI_WEB_SEARCH_ENABLED !== 'false',
    maxRequestLength: Number(base.maxRequestLength ?? env.AI_MAX_REQUEST_LENGTH ?? 1600),
    perUserRateLimit: Number(base.perUserRateLimit ?? env.AI_PER_USER_RATE_LIMIT ?? 10),
    dailyRequestLimit: Number(base.dailyRequestLimit ?? env.AI_DAILY_LIMIT ?? 500),
  };
}

export function getProviderConfig(env: Record<string, string | undefined>): ProviderConfig[] {
  const config = resolveAiConfig(env);
  const provider = config.provider || 'sealify';
  const providers: ProviderConfig[] = [];

  if (provider === 'sealify') {
    const sealifyBaseUrl = (config.baseUrl || env.AI_LOCAL_BASE_URL || env.SEALIFY_MODEL_BASE_URL || DEFAULT_SEALIFY_URL).trim();
    providers.push({
      provider,
      enabled: config.enabled !== false,
      model: config.model || DEFAULT_SEALIFY_MODEL,
      baseUrl: sealifyBaseUrl,
      apiKey: config.apiKey,
      webSearchEnabled: config.webSearchEnabled !== false,
      fallbackEnabled: env.AI_FALLBACK_ENABLED === 'true',
      maxRequestLength: Number(config.maxRequestLength || 1600),
      perUserRateLimit: Number(config.perUserRateLimit || 10),
      dailyRequestLimit: Number(config.dailyRequestLimit || 500),
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
