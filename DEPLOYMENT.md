# Sealify — WhoGoHost Shared Hosting Deployment Guide

This guide walks you through deploying the Sealify Laravel marketplace on WhoGoHost shared hosting (cPanel).

## Pre-deployment (already done)

- [x] `APP_KEY` generated in `.env`
- [x] `APP_ENV=production`, `APP_DEBUG=false`
- [x] `config:cache`, `route:cache`, `view:cache` built locally
- [x] Duplicate route names fixed (`admin.dashboard`, `auth.google`, `auth.apple`)
- [x] `public/.htaccess` present for URL rewriting
- [x] `.env.production.example` template created

---

## Step 1: Create MySQL database on WhoGoHost

1. Log in to WhoGoHost cPanel.
2. Go to **MySQL Databases**.
3. Create a new database (e.g., `sealify_prod`).
4. Create a new database user and password.
5. Add the user to the database with **All Privileges**.

Record these values — you'll need them for `.env`:
- Database name
- Database username
- Database password

---

## Step 2: Upload files

### Option A: Document Root = `/public` (Recommended)

If WhoGoHost lets you set the domain's document root to `/public`:

1. In cPanel → **Domains** → **Addon Domains** (or Subdomains), set the document root to `/public`.
2. Upload the entire Laravel project **except** these:
   - `node_modules/`
   - `.git/`
   - `public/` (it IS the document root)
   - `.env` (create fresh on server — see Step 3)
   - `bootstrap/cache/*.php` (regenerate on server)

3. Upload these to `/public`:
   - Everything inside the local `public/` folder (`index.php`, `.htaccess`, `css/`, `js/`, `images/`, etc.)
   - `storage/` symlink (create manually if needed — see Step 6)

### Option B: Document Root = `/public_html` (Alternative)

If you must use `public_html` as the web root:

1. Move everything inside `public/` into `public_html/`.
2. Place the rest of the Laravel app (`app/`, `config/`, `routes/`, `storage/`, etc.) one level above `public_html` (outside web access).
3. Edit `public_html/index.php` to point to the correct paths:
   ```php
   require __DIR__.'/../vendor/autoload.php';
   $app = require_once __DIR__.'/../bootstrap/app.php';
   ```
4. Upload `vendor/` from your local `composer install` (if no SSH/Composer on server).

---

## Step 3: Create `.env` on the server

Create `.env` in the Laravel root (one level above `public` or `public_html`) using `.env.production.example`:

```bash
cp .env.production.example .env
```

Edit `.env` and fill in your values:

```env
APP_NAME=Sealify
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

SESSION_SECURE_COOKIE=true
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
FRONTEND_URLS=https://yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
```

**Important:** Never commit `.env` to version control. It contains secrets.

---

## Step 4: Install dependencies (if SSH is available)

If WhoGoHost provides SSH/terminal access:

```bash
cd /home/yourusername/sealify
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
chmod -R 775 storage bootstrap/cache
```

If **no SSH access**, you must:
- Upload `vendor/` from your local machine (run `composer install --no-dev --optimize-autoloader` locally first).
- Import your database SQL dump via cPanel → phpMyAdmin instead of running migrations.
- Run `php artisan storage:link` locally before uploading, or create the symlink manually.

---

## Step 5: Set file permissions

```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
chmod -R 775 public/storage/  (if it exists)
```

In cPanel File Manager, you can right-click folders → **Change Permissions** → `755` for folders, `644` for files.

---

## Step 6: Create storage symlink

If `php artisan storage:link` cannot be run on the server:

1. Create the directory: `public/storage/`
2. Create a symlink pointing to `../storage/app/public`:
   ```bash
   ln -s ../storage/app/public public/storage
   ```
   Or in cPanel File Manager, use Terminal if available, or upload files directly to `public/storage/`.

---

## Step 7: Point domain to WhoGoHost

1. Update your domain's nameservers to point to WhoGoHost (provided in your welcome email).
2. Or update the A record to WhoGoHost's server IP.
3. Wait for DNS propagation (can take up to 24-48 hours).

---

## Step 8: Enable SSL

1. In cPanel → **SSL/TLS Status** or **Let's Encrypt SSL**.
2. Install a free SSL certificate for your domain.
3. Ensure `APP_URL=https://yourdomain.com` in `.env`.

---

## Step 9: Test the site

Visit `https://yourdomain.com` and verify:
- Homepage loads
- Ad listings display
- Search works
- User registration/login works
- Community news board loads
- Admin dashboard loads (for admin users)

---

## Files NOT to upload

```
node_modules/
.git/
.env (create manually on server)
bootstrap/cache/*.php (regenerate on server)
vendor/ (only if running composer on server)
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 500 Internal Server Error | Check `storage/logs/laravel.log`. Ensure `APP_KEY` is set in `.env`. |
| CSS/images not loading | Run `php artisan storage:link` and verify `public/storage` symlink. |
| Routes returning 404 | Ensure `public/.htaccess` is uploaded and `mod_rewrite` is enabled on the server. |
| Database connection error | Verify MySQL credentials in `.env` and that the user has privileges. |
| Sessions not working | Set `SESSION_SECURE_COOKIE=true` and ensure HTTPS is active. |

---

## Rollback / revert Cloudflare

If you were previously using Cloudflare Pages:
1. Remove any Cloudflare Pages project for this domain.
2. Point your domain's DNS to WhoGoHost instead of Cloudflare.
3. Update `APP_URL` and `FRONTEND_URLS` in `.env` to your WhoGoHost domain.
