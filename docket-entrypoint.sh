#!/usr/bin/env sh
set -euo pipefail

# Prefer explicit env var; fallback to service token var name if you use it
if [ -n "${DOPPLER_TOKEN:-}" ]; then
  doppler secrets download --no-file --format env > .env
elif [ -n "${DOPPLER_SERVICE_TOKEN:-}" ]; then
  DOPPLER_TOKEN="$DOPPLER_SERVICE_TOKEN" doppler secrets download --no-file --format env > .env
fi

exec npm run start
