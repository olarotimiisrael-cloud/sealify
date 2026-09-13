/// <reference types="@cloudflare/workers-types" />

interface Hyperdrive {
  connectionString: string;
}

interface Env {
  HYPERDRIVE: Hyperdrive;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  JWT_SECRET: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    sql: ReturnType<typeof import('postgres')>;
    supabase: import('@supabase/supabase-js').SupabaseClient;
    user: { id: string; email: string } | null;
    isAdmin: boolean;
  }
}