#!/bin/bash
set -e

# Support Render dynamic PORT
PORT_NUMBER="${PORT:-80}"
sed -i "s/80/${PORT_NUMBER}/g" /etc/apache2/ports.conf /etc/apache2/sites-available/*.conf

# Optimize Laravel configuration for production
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run database migrations if DB is configured
if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "127.0.0.1" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || echo "Migration skipped or database not reachable yet."
fi

# Execute main Apache process
exec apache2-foreground
