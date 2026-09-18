#!/bin/sh

set -e

php artisan optimize

php-fpm -D

nginx -g "daemon off;"