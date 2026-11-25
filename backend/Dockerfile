
FROM serversideup/php:8.3-fpm-nginx

USER root

WORKDIR /var/www/html

COPY . .

# Install production dependencies
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# Give Laravel permission to write cache and log files
RUN chown -R www-data:www-data storage bootstrap/cache

ENV NGINX_WEBROOT=/var/www/html/public

USER www-data
