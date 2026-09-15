export interface Env {
  HYPERDRIVE: Hyperdrive;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  AI_PROVIDER?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  AI_WEB_SEARCH_ENABLED?: string;
  AI_FALLBACK_ENABLED?: string;
  TERMII_API_KEY?: string;
  ARKESEL_API_KEY?: string;
  TWILIO_ACCOUNT_SID?: string;
  APP_URL?: string;
  PUBLIC_SITE_URL?: string;
  NODE_ENV?: string;
}

export interface Hyperdrive {
  connectionString: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AppContext {
  Variables: {
    sql: ReturnType<typeof import('postgres')>;
    user?: AuthUser;
    supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>;
  };
  Bindings: Env;
}
