export const appEnv = {
  apiBase: import.meta.env.VITE_API_BASE || '/api',
  isProduction: import.meta.env.PROD || import.meta.env.MODE === 'production',
};

export function apiUrl(path: string): string {
  const base = appEnv.apiBase.replace(/\/$/, '');
  let cleanPath = path.replace(/^\//, '');

  // If base already ends with /api, strip the duplicate /api/ prefix from path
  if (base.endsWith('/api') && cleanPath.startsWith('api/')) {
    cleanPath = cleanPath.slice(4);
  }

  if (base.startsWith('http')) {
    return `${base}/${cleanPath}`;
  }
  return '/' + (base.startsWith('/') ? base.slice(1) : base) + '/' + cleanPath;
}
