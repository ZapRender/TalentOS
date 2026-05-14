FROM php:8.2-apache
WORKDIR /var/www/html
RUN docker-php-ext-install pdo pdo_mysql mysqli
RUN a2enmod rewrite
COPY apache.conf /etc/apache2/sites-available/000-default.conf
COPY . .
EXPOSE 9000
