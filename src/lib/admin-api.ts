import { supabase } from '@/integrations/supabase/client';
import { apiUrl } from '@/lib/env';

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  const url = typeof input === 'string' && input.startsWith('/api/') ? apiUrl(input) : input;
  return fetch(url, { ...init, headers });
}
