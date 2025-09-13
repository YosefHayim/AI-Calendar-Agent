# ---- Builder ----
  FROM node:22-slim AS builder
  WORKDIR /app
  
  # Enable pnpm via corepack
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
  
  # Bring compiled JS
  COPY --from=builder /app/dist ./dist
  
  # Entrypoint will fetch .env from Doppler and start
  COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
  RUN chmod +x /usr/local/bin/docker-entrypoint.sh
  
  EXPOSE 3000
  ENTRYPOINT ["docker-entrypoint.sh"]
  