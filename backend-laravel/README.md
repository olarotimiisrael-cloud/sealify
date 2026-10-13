# Sealify Laravel API Backend

This folder contains the production-ready Laravel backend for Sealify. It provides the full API and MySQL database layer while the existing Vite/React frontend remains unchanged.

## Stack

- Laravel 11/12/13
- PHP 8.2+
- MySQL 8.0+
- Laravel Sanctum token authentication
- OpenAI/Gemini-backed Copilot endpoint

## Local setup

This backend ships as a set of Laravel API modules. Run the included installer to generate a real Laravel 11 application and overlay the Sealify controllers, models, migrations, routes, and middleware:

```bash
cd backend-laravel
chmod +x setup.sh
./setup.sh laravel-app
cd laravel-app
```

On Windows PowerShell:

```powershell
cd backend-laravel
.\setup.ps1 -Target laravel-app
```

Then edit `laravel-app/.env` for MySQL and AI credentials, then:

```bash
php artisan migrate
php artisan test
php artisan serve --host=127.0.0.1 --port=8000
```

The API is served under:

```text
http://127.0.0.1:8000/api
```

## Frontend integration

Do not redesign the frontend. In the frontend production build environment, point the SPA at Laravel:

```bash
VITE_API_BASE=https://api.your-domain.com/api
```

The existing React app will call the same endpoints under `/api`.

## Production deployment on a purchased VPS/cPanel panel

Use a server running Nginx/Apache, PHP-FPM 8.2+, MySQL 8, Composer, and Git.

```bash
cd /var/www/sealify
git clone <repo> .            # or upload backend-laravel into /var/www/sealify/backend
cd backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
sudo chown -R www-data:www-data storage bootstrap/cache
```

Nginx should point the API domain root to:

```text
/var/www/sealify/backend/public
```

Example Nginx server block:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    root /var/www/sealify/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    }
}
```

Then enable SSL with Certbot:

```bash
sudo certbot --nginx -d api.your-domain.com
```

## Frontend build

After building the React app, deploy `dist/` to Cloudflare Pages/Netlify/VPS and set:

```bash
VITE_API_BASE=https://api.your-domain.com/api
```

The SPA visual design does not change because only the API origin changes.

## Optional single-server fullstack hosting

To serve the React app from Laravel on one VPS, copy the Vite `dist/` contents into the Laravel `public/` directory instead of using a separate frontend host. The SPA fallback route in `routes/web.php` will serve `public/index.html` for non-API routes, and the API remains under `/api`.

## Core API endpoints

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

Listings:

- `GET /api/listings`
- `GET /api/listings/{id}`
- `POST /api/listings`
- `PUT /api/listings/{id}`
- `DELETE /api/listings/{id}`

Generic marketplace data:

- `GET /api/data/{resource}`
- `GET /api/data/{resource}/{id}`
- `POST /api/data/{resource}`
- `PUT /api/data/{resource}/{id}`
- `PATCH /api/data/{resource}/{id}`
- `DELETE /api/data/{resource}/{id}`

Supported resources include `profiles`, `categories`, `subcategories`, `ads`, `ad_images`, `announcements`, `reviews`, `buyer_requests`, `buyer_request_responses`, `favorites`, `search_alerts`, `saved_searches`, `user_settings`, `push_subscriptions`, `verification_requests`, `password_requests`, `conversations`, `messages`, `notifications`, `reports`, `audit_logs`, `intrusion_logs`, `system_configs`, `site_settings`, `promotion_plans`, `safe_spots`, `recent_deals`, `wallets`, `transactions`, `promotion_payments`, `disputes`, `escrow_orders`, `analytics_events`, `performance_metrics`, `email_otps`, `phone_otps`, `admin_messages`, `admin_broadcasts`, `admin_signup_alerts`, `admin_login_sessions`, `referrals`, `referral_rewards`, `referral_clicks`, `email_outbox`, `shareable_links`, `ad_card_assets`, `qr_codes`, `status_templates`, `social_share_events`, `verification_badges`, `credential_verifications`, and `message_attachments`.

Messaging:

- `GET /api/conversations`
- `GET /api/conversations/{id}/messages`
- `POST /api/conversations/{id}/messages`

Copilot:

- `POST /api/copilot`

Uploads:

- `POST /api/uploads`

Admin:

- `GET /api/admin/users`
- `PUT /api/admin/users/{id}`
- `DELETE /api/admin/users/{id}`
- `POST /api/admin/users/bulk`
- `PUT /api/admin/verifications/{id}`
- `PUT /api/admin/promotions/{id}`
- `PUT /api/admin/reports/{id}`
- `PUT /api/admin/disputes/{id}`
- `GET /api/admin/signup-alerts`
- `PUT /api/admin/signup-alerts/{id}`
- `DELETE /api/admin/signup-alerts/{id}`
- `GET /api/admin/login-sessions`
- `DELETE /api/admin/login-sessions/{id}`
- `GET /api/admin/system-config`
- `PUT /api/admin/system-config`
- `POST /api/admin/broadcast`
- `POST /api/admin/email-digest`
- `POST /api/email/admin/send`
- `POST /api/email/password-reset`
- `POST /api/email/admin/sms`
- `POST /api/email/admin/whatsapp`
- `POST /api/email/admin/upload-attachment`

## Notes

- Listings images are stored as URLs, making the app compatible with R2, S3, Supabase Storage, or local disk.
- Responses use snake_case JSON keys so existing frontend contracts continue to work.
- The Copilot endpoint reads `AI_PROVIDER`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, and related model settings from Laravel `.env`.
