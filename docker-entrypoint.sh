#!/bin/sh
# ---------------------------------------------------------------------------
# Sealify staging entrypoint.
#
# Configures Apache to listen on Render's $PORT, ensures writable storage
# directories exist, then starts Apache in the foreground.
#
# No database migrations, seeders, or resets are run here — migrations must
# be executed separately (e.g. via a Render shell or a one-off deploy step)
# against the dedicated staging database.
# ---------------------------------------------------------------------------
set -e

# Render injects the container port through $PORT.
PORT="${PORT:-8000}"

# Make Apache listen on the Render-provided port.
sed -i "s/^Listen 80$/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/\*:80/*:${PORT}/" /etc/apache2/sites-available/000-default.conf 2>/dev/null || true

# Ensure writable runtime directories exist (owned by www-data).
mkdir -p storage/framework/views storage/framework/sessions storage/framework/cache bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Start Apache in the foreground so the container stays alive.
exec apache2-foreground
