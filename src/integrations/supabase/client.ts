import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
  
  if (isProduction) {
    // In production, fail fast with clear error - never initialize with placeholders
    const errorMsg = `❌ CRITICAL: Supabase credentials missing!
    
Required environment variables:
- VITE_SUPABASE_URL: ${SUPABASE_URL ? '✓ Set' : '✗ MISSING'}
- VITE_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✓ Set' : '✗ MISSING'}

Configure these in Cloudflare Pages: Settings → Environment Variables

Application cannot start without valid Supabase credentials.`;
    
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  // Development: warn but allow fallback for local development
  console.warn('⚠️ WARNING: Supabase credentials not set. Using development fallback.');
}

// Create client with validated credentials
export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
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