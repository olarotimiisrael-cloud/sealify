# ---------------------------------------------------------------------------
# Sealify — Combined Frontend + Laravel staging deployment
# Multi-stage Dockerfile for a single Render web service.
#
# Stage 1: Build the React/Vite frontend into Laravel's public/ directory.
# Stage 2: Run the Laravel application (PHP 8.3 + Apache) serving public/.
# ---------------------------------------------------------------------------

# ===========================================================================
# Stage 1 — Frontend build (Node 22, committed lockfile)
# ===========================================================================
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

# Install frontend dependencies from the committed lockfile.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy frontend source and build into Laravel's public/ directory.
# vite.config.ts sets outDir to ../public (i.e. /app/public) with emptyOutDir
# disabled so Laravel's public/index.php survives.
COPY frontend/ ./
ENV NODE_ENV=production
ENV VITE_API_BASE=/api
RUN npm run build

# ===========================================================================
# Stage 2 — Laravel application (PHP 8.3 + Apache)
# ===========================================================================
FROM php:8.3-apache

# System packages + PHP extensions required by composer.lock deps and
# PostgreSQL connectivity (PDO_PGSQL for the staging pgsql connection).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        curl \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
        libzip-dev \
        libpq-dev \
        zip \
        unzip \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_pgsql \
        pgsql \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
    && rm -rf /var/lib/apt/lists/*

# Composer (from the official Composer image).
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Apache: URL rewriting for Laravel front controller + SPA fallback.
RUN a2enmod rewrite

WORKDIR /var/www/html

# Copy the Laravel application (secrets, node_modules, vendor, etc. are
# excluded via .dockerignore — never commit .env or credentials).
COPY --chown=www-data:www-data . .

# Install PHP dependencies from the committed lockfile (production only).
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# Copy the compiled frontend from stage 1 into Laravel's document root.
# This produces public/index.html + public/assets/* while preserving
# public/index.php, public/.htaccess, and other required files.
COPY --from=frontend-build --chown=www-data:www-data /app/public /var/www/html/public

# Writable directories for sessions, cache, views, and file uploads.
RUN mkdir -p storage/framework/views storage/framework/sessions storage/framework/cache bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Entrypoint: configure Apache to listen on Render's $PORT, ensure dirs,
# then start Apache in the foreground.
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Render injects the listening port via $PORT. Default to 8000 locally.
ENV PORT=8000
EXPOSE 8000

# NOTE: Do not set `USER www-data` before the entrypoint. The entrypoint must
# run as root once to (a) edit the root-owned Apache port config for $PORT and
# (b) chown storage/ and bootstrap/cache/ to www-data. Apache then drops its
# worker processes to www-data automatically via its default User/Group
# directive, so the web server does not run as a privileged user unnecessarily.
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["apache2-foreground"]
