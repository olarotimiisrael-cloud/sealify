# Cloudflare Setup for Sealify

This document provides instructions for setting up Cloudflare Pages and Cloudflare Workers for the Sealify project.

## Prerequisites

- Cloudflare account with Pages and Workers enabled
- Project repository with this configuration

## Cloudflare Pages Setup

### 1. Create a Cloudflare Pages Project

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com)
2. Navigate to "Workers & Pages" → "Pages"
3. Click "Create a new application"
4. Select "Connect to GitHub" and choose your Sealify repository
5. Set "Framework preset" to "Vite"

### 2. Configure Environment Variables

In Cloudflare Pages Settings → Environment Variables, add the following:

#### Supabase Configuration
```json
{
  "SUPABASE_URL": "https://eliwjdafimaugnwvadlr.supabase.co",
  "SUPABASE_ANON_KEY": "sb_publishable_h4te__ofhyf2Ou5uALG-Sw_lsKjDQR7",
  "SUPABASE_SERVICE_ROLE_KEY": "your-supabase-service-role-key"
}
```

#### Turnstile (Cloudflare bot protection)
```json
{
  "TURNSTILE_SITE_KEY": "your-turnstile-site-key",
  "TURNSTILE_SECRET_KEY": "your-turnstile-secret-key"
}
```

#### SMS/WhatsApp Providers

Choose ONE of the following for phone OTP services:

**Option 1: WhatsApp Cloud API**
```json
{
  "WHATSAPP_ACCESS_TOKEN": "your-whatsapp-access-token",
  "PHONE_NUMBER_ID": "your-whatsapp-phone-number-id"
}
```

**Option 2: Termii**
```json
{
  "TERMII_API_KEY": "your-termii-api-key",
  "TERMII_SENDER_ID": "Sealify"
}
```

**Option 3: Arkesel**
```json
{
  "ARKESEL_API_KEY": "your-arkesel-api-key",
  "ARKESEL_SENDER_ID": "Sealify"
}
```

**Option 4: Twilio**
```json
{
  "TWILIO_ACCOUNT_SID": "your-twilio-account-sid",
  "TWILIO_AUTH_TOKEN": "your-twilio-auth-token",
  "TWILIO_FROM": "+2340000000000"
}
```

#### Firebase (for Email Link Authentication)
```json
{
  "VITE_FIREBASE_API_KEY": "your-firebase-api-key",
  "VITE_FIREBASE_AUTH_DOMAIN": "your-firebase-auth-domain",
  "VITE_FIREBASE_PROJECT_ID": "your-firebase-project-id",
  "VITE_FIREBASE_STORAGE_BUCKET": "your-firebase-storage-bucket",
  "VITE_FIREBASE_MESSAGING_SENDER_ID": "your-firebase-messaging-sender-id",
  "VITE_FIREBASE_APP_ID": "your-firebase-app-id"
}
```

#### Additional Configuration
```json
{
  "APP_URL": "https://sealify.pages.dev",
  "PUBLIC_SITE_URL": "https://sealify.pages.dev",
  "NODE_ENV": "production",
  "AI_PROVIDER": "sealify",
  "AI_WEB_SEARCH_ENABLED": "true",
  "AI_FALLBACK_ENABLED": "true"
}
```

### 3. Build and Deploy

In your local repository:

```bash
npm run build
npm run deploy:pages
```

### 4. Cloudflare Hyperdrive Setup

Sealify uses Cloudflare Hyperdrive for database connections. Ensure:

1. Create a Hyperdrive instance in your Cloudflare dashboard
2. Connect your Supabase database
3. Copy the connection string ID and paste it in wrangler.toml:
```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "YOUR_HYPERDRIVE_ID"
```

## Cloudflare Workers (API Routes)

The application uses Cloudflare Workers to handle API routes. The Workers are configured through wrangler.toml:

### wrangler.toml Configuration

```toml
name = "sealify"
compatibility_date = "2026-08-31"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "./dist"

[[hyperdrive]]
binding = "HYPERDRIVE"
id = "4450cb10a9fb4977ba6a1d1cd2e6b110"

[vars]
SUPABASE_URL = "https://eliwjdafimaugnwvadlr.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_h4te__ofhyf2Ou5uALG-Sw_lsKjDQR7"
AI_PROVIDER = "sealify"
AI_WEB_SEARCH_ENABLED = "true"
AI_FALLBACK_ENABLED = "true"
APP_URL = "https://sealify.pages.dev"
PUBLIC_SITE_URL = "https://sealify.pages.dev"
NODE_ENV = "production"
NPM_CONFIG_PRODUCTION = "false"
```

### API Routes

The application provides the following API routes:

- `/api/auth/*` - Authentication endpoints
- `/api/listings/*` - Listing management
- `/api/categories` - Category endpoints
- `/api/search` - Search functionality
- `/api/reviews` - Review endpoints
- `/api/buyer-requests` - Buyer request endpoints
- `/api/messages` - Messaging endpoints
- `/api/notifications` - Notification endpoints
- `/api/users` - User management
- `/api/analytics` - Analytics endpoints
- `/api/push` - Push notification endpoints
- `/api/copilot` - AI Copilot endpoints
- `/api/admin` - Admin endpoints
- `/api/market-insights` - Market insights endpoints
- `/api/email` - Email service endpoints
- `/api/functions/api/send-whatsapp-otp` - WhatsApp OTP service (Cloudflare Pages Function)

## WhatsApp OTP Service

The WhatsApp OTP service is deployed as a Cloudflare Pages Function:

### Required Setup

1. Configure WhatsApp Business API credentials:
   - WhatsApp Access Token
   - Phone Number ID

2. The service:
   - Receives POST requests with phone numbers
   - Generates 6-digit OTP codes
   - Stores OTP in Supabase `phone_otps` table
   - Sends OTP via WhatsApp Cloud API
   - Returns success response

### Database Schema (phone_otps)

```sql
CREATE TABLE IF NOT EXISTS public.phone_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  channel text NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms', 'whatsapp', 'push')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## Security Configuration

### Turnstile Integration

Admin login page includes Cloudflare Turnstile for bot protection:
- Rendered dynamically on `/admin/login`
- Required for admin authentication
- Added to `loginSchema` validation

### Rate Limiting

- Auth endpoints: 10 requests per 15 minutes
- Listings endpoints: 60 requests per minute
- Copilot endpoints: 20 requests per minute

### CORS Configuration

All API routes support CORS for secure cross-origin requests.

## Development

### Local Development

```bash
# Start local development server
npm run dev

# Start local Pages development server
npm run dev:pages

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint

# Full check
npm run check
```

### Environment Variables

For local development, create a `.env` file with your configuration:

See `.env.example` for all required variables.

## Production Deployment

1. Run build to generate static assets
2. Deploy to Cloudflare Pages using wrangler
3. Configure all environment variables in Cloudflare dashboard
4. Ensure Hyperdrive connection is properly configured
5. Verify all API routes are working
6. Test admin login with Turnstile
7. Test phone OTP functionality

## Troubleshooting

### Common Issues

1. **Supabase connection errors**
   - Verify HYPERDRIVE connection string
   - Check Supabase URL and ANON_KEY configuration

2. **WhatsApp API errors**
   - Verify WhatsApp access token and phone number ID
   - Check Meta WhatsApp Cloud API configuration

3. **Firebase configuration**
   - Ensure all VITE_FIREBASE_* environment variables are set
   - Verify Firebase project configuration in console

4. **Turnstile errors**
   - Verify site key and secret key configuration
   - Check Turnstile JavaScript load

## References

- [Cloudflare Pages Documentation](https://pages.cloudflare.com)
- [Cloudflare Workers Documentation](https://workers.cloudflare.com)
- [Cloudflare Hyperdrive Documentation](https://developers.cloudflare.com/hyperdrive)
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile)
- [Meta WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
