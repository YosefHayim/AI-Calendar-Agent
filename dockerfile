# ---- Base with pnpm ----------------------------------------------------------
  FROM node:22-bookworm-slim AS base
  WORKDIR /app
  ENV PNPM_HOME=/usr/local/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
  
  # ---- Dependencies (uses lockfile; fails if out of sync) ----------------------
  FROM base AS deps
  COPY package.json pnpm-lock.yaml ./
  RUN pnpm install --frozen-lockfile
  
  # ---- Build (optional; safe if no build script) -------------------------------
  FROM base AS build
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN pnpm run build || echo "no build script"
  
  # Produce production-only node_modules
  RUN pnpm prune --prod
  
  # ---- Runtime -----------------------------------------------------------------
  FROM node:22-bookworm-slim AS runner
  WORKDIR /app
  ENV NODE_ENV=production
  ENV HOST=0.0.0.0
  ENV PORT=3000
  # pnpm needed only if your start script calls pnpm; enable anyway for safety
  ENV PNPM_HOME=/usr/local/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
  
  # Prefer running as non-root
  USER node
  
  # App files
  COPY --chown=node:node --from=build /app/node_modules ./node_modules
  # If you have a build output, copy it; otherwise the whole tree is already in build
  # Copy dist if it exists; ignore if not
  COPY --chown=node:node --from=build /app/dist ./dist
  COPY --chown=node:node package.json ./
  
  # Expose app port
  EXPOSE 3000
  
  # If your start script runs the built server, keep as-is. Otherwise, swap to "node dist/index.js"
  CMD ["pnpm","start"]
  