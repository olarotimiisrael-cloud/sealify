import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
// NEVER import this in client-side code (src/)
// Only use in Cloudflare Workers (server/) and API routes

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase credentials missing!');
}

export const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public',
  },
});

// Export default as supabase to match service expectations
export default supabaseAdmin;
export const supabase = supabaseAdmin;