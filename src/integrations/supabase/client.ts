import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/lib/env';

const { hasConfig, missing, isProduction } = getSupabaseConfig();
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!hasConfig) {
  const errorMsg = `❌ CRITICAL: Supabase credentials missing!

Required environment variables:
${missing.map((key) => `- ${key}: ✗ MISSING`).join('\n')}

Configure these in Cloudflare Pages or GitHub Actions before deploying.
Application cannot start without valid Supabase credentials.`;

  if (isProduction) {
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.warn('⚠️ WARNING: Supabase credentials not set. Using development fallback.');
}

export const supabase = createClient(SUPABASE_URL || 'https://placeholder.supabase.co', SUPABASE_ANON_KEY || 'placeholder-key', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'sealify-nigeria-web',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;