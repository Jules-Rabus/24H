#syntax=docker/dockerfile:1

FROM dunglas/frankenphp:1.12.2-php8.4 AS frankenphp_base

# For local build
COPY ./ZscalerRootCerts/ZscalerRootCertificate-2048-SHA256.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates

SHELL ["/bin/bash", "-euxo", "pipefail", "-c"]

WORKDIR /app

VOLUME /app/var/

# Runtime and build dependencies required by the current app and entrypoint.
RUN <<-'EOF'
	apt-get update
	apt-get install -y --no-install-recommends \
		acl \
		file \
		git
	install-php-extensions \
		@composer \
		apcu \
		intl \
		opcache \
		pdo_pgsql \
		zip
	rm -rf /var/lib/apt/lists/*
EOF

ENV COMPOSER_ALLOW_SUPERUSER=1
ENV PHP_INI_SCAN_DIR=":$PHP_INI_DIR/app.conf.d"

COPY --link frankenphp/conf.d/10-app.ini $PHP_INI_DIR/app.conf.d/
COPY --link --chmod=755 frankenphp/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
COPY --link frankenphp/Caddyfile /etc/frankenphp/Caddyfile

ENTRYPOINT ["docker-entrypoint"]

HEALTHCHECK --start-period=60s CMD php -r 'exit(false === @file_get_contents("http://localhost:2019/metrics", context: stream_context_create(["http" => ["timeout" => 5]])) ? 1 : 0);'
CMD ["frankenphp", "run", "--config", "/etc/frankenphp/Caddyfile"]

FROM frankenphp_base AS frankenphp_dev

ENV APP_ENV=dev
ENV XDEBUG_MODE=off
ENV FRANKENPHP_WORKER_CONFIG=watch

RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini" \
	&& install-php-extensions xdebug

COPY --link frankenphp/conf.d/20-app.dev.ini $PHP_INI_DIR/app.conf.d/

CMD ["frankenphp", "run", "--config", "/etc/frankenphp/Caddyfile", "--watch"]

FROM frankenphp_base AS frankenphp_prod

ENV APP_ENV=prod

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY --link frankenphp/conf.d/20-app.prod.ini $PHP_INI_DIR/app.conf.d/

COPY --link composer.* symfony.* ./
RUN composer install --no-cache --prefer-dist --no-dev --no-autoloader --no-scripts --no-progress

COPY --link --exclude=frankenphp/ . ./

RUN <<-'EOF'
	mkdir -p var/cache var/log var/share
	composer dump-autoload --classmap-authoritative --no-dev
	composer dump-env prod
	composer run-script --no-dev post-install-cmd
	if [ -f importmap.php ]; then
		php bin/console asset-map:compile
	fi
	chmod +x bin/console
	sync
EOF

