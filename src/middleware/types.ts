export interface Env {
  HYPERDRIVE?: Hyperdrive;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  AI_PROVIDER?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  AI_WEB_SEARCH_ENABLED?: string;
  AI_FALLBACK_ENABLED?: string;
  TERMII_API_KEY?: string;
  TERMII_SENDER_ID?: string;
  ARKESEL_API_KEY?: string;
  ARKESEL_SENDER_ID?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM?: string;
  WHATSAPP_ACCESS_TOKEN?: string;
  PHONE_NUMBER_ID?: string;
  FCM_SERVER_KEY?: string;
  FCM_SENDER_ID?: string;
  APP_URL?: string;
  PUBLIC_SITE_URL?: string;
  NODE_ENV?: string;
  // Self-hosted email service
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  EMAIL_FROM?: string;
  // Self-hosted SMS gateway
  SMS_GATEWAY_URL?: string;
  SMS_GATEWAY_USERNAME?: string;
  SMS_GATEWAY_PASSWORD?: string;
  // OTP configuration
  OTP_LENGTH?: string;
  OTP_EXPIRY_MS?: string;
  BROADCAST_CONCURRENCY?: string;
  // Admin messaging
  ADMIN_EMAIL_FROM?: string;
  PASSWORD_RESET_EMAIL_FROM?: string;
  MAX_ATTACHMENT_SIZE?: string;
}

export interface Hyperdrive {
  connectionString: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AppContext {
  Variables: {
    sql: ReturnType<typeof import('postgres')>;
    user?: AuthUser;
    supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>;
  };
  Bindings: Env;
}
