# ---- Builder ----
  FROM node:22-slim AS builder
  WORKDIR /app
  
  # pnpm via corepack
  RUN corepack enable
  
  # Install deps (cached) and build
  COPY package.json pnpm-lock.yaml* ./
  RUN pnpm install --frozen-lockfile
  COPY . .
  RUN pnpm run build
  
  # ---- Runtime ----
  FROM node:22-slim AS runtime
  WORKDIR /app
  ENV NODE_ENV=production
  
  # Doppler CLI + corepack
  RUN apt-get update -y && apt-get install -y curl ca-certificates && rm -rf /var/lib/apt/lists/* \
    && curl -Ls https://cli.doppler.com/install.sh | sh \
    && corepack enable
  
  # Prod deps only
  COPY package.json pnpm-lock.yaml* ./
  RUN pnpm install --prod --frozen-lockfile
  
  # Compiled app
  COPY --from=builder /app/dist ./dist
  
  # Inline entrypoint (no external file needed)
  RUN printf '%s\n' \
    '#!/bin/sh' \
    'set -e' \
    'TOK="${DOPPLER_TOKEN:-${DOPPLER_SERVICE_TOKEN:-}}"' \
    'if [ -n "$TOK" ]; then DOPPLER_TOKEN="$TOK" doppler secrets download --no-file --format env > .env; fi' \
    'exec npm run start' > /usr/local/bin/docker-entrypoint \
    && chmod +x /usr/local/bin/docker-entrypoint
  
  EXPOSE 3000
  ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]
  