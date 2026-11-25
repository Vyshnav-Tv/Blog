
FROM serversideup/php:8.3-fpm-nginx

USER root

WORKDIR /var/www/html

COPY . .

# Install production dependencies
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# Create the public URL for files stored on the public disk.
RUN php artisan storage:link

# Give Laravel permission to write cache and log files
RUN chown -R www-data:www-data storage bootstrap/cache

ENV NGINX_WEBROOT=/var/www/html/public
ENV NGINX_CLIENT_MAX_BODY_SIZE=3m
ENV PHP_UPLOAD_MAX_FILE_SIZE=2M
ENV PHP_POST_MAX_SIZE=3M

USER www-data
