#!/bin/sh

set -e

php artisan migrate --force
php artisan optimize

php-fpm -D
nginx -g "daemon off;"