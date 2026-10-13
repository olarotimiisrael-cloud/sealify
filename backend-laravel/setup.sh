#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-laravel-app}"

if ! command -v composer >/dev/null 2>&1; then
  echo "Composer is required. Install Composer and PHP 8.2+ first."
  exit 1
fi

echo "Creating Laravel 11 application in: $TARGET"
composer create-project laravel/laravel "$TARGET" --remove-vcs --no-interaction

echo "Overlaying Sealify backend modules"
rm -rf "$TARGET/app/Http/Controllers/Api"
mkdir -p "$TARGET/app/Http/Controllers/Api" "$TARGET/app/Models" "$TARGET/app/Services" "$TARGET/app/Http/Middleware" "$TARGET/routes" "$TARGET/database/migrations"

cp -a app/Http/Controllers/Api/. "$TARGET/app/Http/Controllers/Api/"
cp -a app/Http/Controllers/Controller.php "$TARGET/app/Http/Controllers/Controller.php"
cp -a app/Http/Middleware/. "$TARGET/app/Http/Middleware/"
cp -a app/Models/. "$TARGET/app/Models/"
cp -a app/Services/. "$TARGET/app/Services/"
cp -a routes/api.php "$TARGET/routes/api.php"
cp -a routes/web.php "$TARGET/routes/web.php"
cp -a database/migrations/. "$TARGET/database/migrations/"
cp -a bootstrap/app.php "$TARGET/bootstrap/app.php"
cp -a config/cors.php "$TARGET/config/cors.php"
cp -a .env.example "$TARGET/.env.sealify.example"
cp -a tests/SealifyApiTest.php "$TARGET/tests/Feature/SealifyApiTest.php"

cd "$TARGET"

composer require laravel/sanctum
php artisan install:api --no-interaction || true

php artisan key:generate --force

echo "Sealify Laravel backend is ready in $TARGET"
echo "Next: configure $TARGET/.env, then run: php artisan migrate"
