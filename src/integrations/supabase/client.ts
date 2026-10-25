import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/lib/env';

const { hasConfig, missing } = getSupabaseConfig();
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!hasConfig) {
  const errorMsg = `❌ CRITICAL: Supabase credentials missing!

Required environment variables:
${missing.map((key) => `- ${key}: ✗ MISSING`).join('\n')}

Configure these in Cloudflare Pages (Settings → Environment variables) before deploying.
Application cannot start without valid Supabase credentials.`;

  console.error(errorMsg);
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