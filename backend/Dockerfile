
FROM richarvey/nginx-php-fpm:3.1.6

WORKDIR /var/www/html

COPY . .

# Prevent the base image from installing Composer dependencies again at startup
ENV SKIP_COMPOSER=1

ENV WEBROOT=/var/www/html/public
ENV PHP_ERRORS_STDERR=1
ENV RUN_SCRIPTS=1
ENV REAL_IP_HEADER=1

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr
ENV COMPOSER_ALLOW_SUPERUSER=1

# Install production dependencies
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

CMD ["/start.sh"]
