#syntax=docker/dockerfile:1

# Versions
FROM node:lts AS node_upstream

# Base stage for dev and build
FROM node_upstream AS base

# For local build behind Zscaler proxy — uncomment when on an enterprise network
# COPY ./ZscalerRootCertificate-2048-SHA256.crt /usr/local/share/ca-certificates/
# RUN set -ex; \
#     apt-get update && apt-get install --yes --no-install-recommends ca-certificates && apt-get clean && rm -rf /var/lib/apt/lists/* && update-ca-certificates
# ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/ZscalerRootCertificate-2048-SHA256.crt

WORKDIR /srv/app

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Delete the following line in case you want to enable telemetry during dev and build.
ENV NEXT_TELEMETRY_DISABLED=1


# Development image
FROM base AS dev

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["sh", "-c", "npm install --legacy-peer-deps; npm run dev"]


FROM base AS builder

COPY --link . .
# Use a unique placeholder during build that will be replaced at runtime
ENV NEXT_PUBLIC_ENTRYPOINT="http://APP_ENTRYPOINT_PLACEHOLDER"
ENV NEXT_PUBLIC_MERCURE_HUB_URL="http://APP_ENTRYPOINT_PLACEHOLDER/.well-known/mercure"
RUN npm ci --legacy-peer-deps && \
	npm run build

# Production image, copy all the files and run next
FROM node_upstream AS prod

WORKDIR /srv/app

ENV NODE_ENV=production
# Delete the following line in case you want to enable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

# Create system user for running the app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Set the correct permission for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --link --chown=1001:1001 /srv/app/.next/standalone ./
COPY --from=builder --link --chown=1001:1001 /srv/app/.next/static ./.next/static
COPY --from=builder --link --chown=1001:1001 /srv/app/public ./public
COPY --from=builder --link --chown=1001:1001 /srv/app/docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

USER nextjs

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
