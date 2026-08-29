import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not configured');
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(config.supabase.url, config.supabase.anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseInstance;
}
