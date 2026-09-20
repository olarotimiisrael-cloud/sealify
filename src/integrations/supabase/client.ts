import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/lib/env';

const { hasConfig, missing, isProduction } = getSupabaseConfig();
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!hasConfig && isProduction) {
  const errorMsg = `CRITICAL: Supabase credentials missing! Required: ${missing.join(', ')}`;
  console.error(errorMsg);
} else if (!hasConfig && !isProduction) {
  console.warn('⚠️ Supabase credentials not set. App running in development mode.');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://fszqjvzqzlfhqxlqzgyh.supabase.co',
  SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeHFqdnFxemxmaHFxbHpneWhIYWQiLCJzdWIiOiJhdXRoMCIsIm5hbWUiOiJzZWFsaWZ5IiwiaWF0IjoxNzE3MDYwMDAwLCJleHAiOjQ1NzY4NjAwMDB9.placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
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
  },
);

export default supabase;
