export const appEnv = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  apiBase: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || '/api',
  isProduction: import.meta.env.PROD || import.meta.env.MODE === 'production',
};

export const getSupabaseConfig = () => {
  const missing: string[] = [];

  if (!appEnv.supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!appEnv.supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');

  return {
    hasConfig: missing.length === 0,
    missing,
    isProduction: appEnv.isProduction,
  };
};

export function apiUrl(path: string): string {
  const base = appEnv.apiBase.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  if (base.startsWith('http')) {
    return `${base}/${cleanPath}`;
  }
  return `/${base}/${cleanPath}`;
}
