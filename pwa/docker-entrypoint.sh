#!/bin/sh
set -e

echo "Starting PWA entrypoint..."

# Variables to replace
VARS="NEXT_PUBLIC_ENTRYPOINT NEXT_PUBLIC_MERCURE_HUB_URL API_ENTRYPOINT"

# Build-time placeholder (must match the value used during 'pnpm build')
PLACEHOLDER="http://APP_ENTRYPOINT_PLACEHOLDER"

# Iterate over variables
for var in $VARS; do
  value=$(eval echo \$$var)
  if [ -n "$value" ]; then
    echo "Replacing $PLACEHOLDER with $value for $var in .next/ and public/ ..."
    find .next public -type f \( -name "*.js" -o -name "*.html" -o -name "*.json" \) -exec sed -i "s|$PLACEHOLDER|$value|g" {} +
  fi
done

echo "Entrypoint done. Starting Next.js..."
exec "$@"
