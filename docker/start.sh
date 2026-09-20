#!/bin/sh

set -e

php artisan migrate --force
php artisan optimize

php-fpm -D

sed -i "s/listen 10000;/listen ${PORT:-10000};/" /etc/nginx/sites-available/default

nginx -g "daemon off;"
