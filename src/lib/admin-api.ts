import { supabase } from '@/integrations/supabase/client';

/**
 * Call a protected admin endpoint with the current Supabase session token.
 * Supabase owns session persistence and refresh; this helper never reads or
 * writes auth tokens through application storage.
 */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(input, { ...init, headers });
}
