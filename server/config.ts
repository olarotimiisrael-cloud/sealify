function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    return '';
  }
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = getEnv(
  'CORS_ORIGINS',
  isProduction
    ? 'https://sealify.ng,https://www.sealify.ng,https://sealify.pages.dev'
    : 'http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  port: parseInt(getEnv('PORT', '3000'), 10),
  isProduction: process.env.NODE_ENV === 'production',
  databaseUrl: getEnv('DATABASE_URL'),
  supabase: {
    url: getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnv('SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY'),
  },
  cors: {
    origins: allowedOrigins,
  },
};
