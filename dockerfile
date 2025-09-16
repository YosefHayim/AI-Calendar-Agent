# --- Base ----------------------------------------------------
  FROM node:22-bookworm-slim
  WORKDIR /app
  
  # pnpm via Corepack
  ENV PNPM_HOME=/usr/local/pnpm
  ENV PATH=$PNPM_HOME:$PATH
  RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
  
  # Optional: tini-like init to handle signals (safe stop)
  RUN apt-get update && apt-get install -y --no-install-recommends dumb-init \
    && rm -rf /var/lib/apt/lists/*
  
  # --- Install deps (keeps devDeps so ts-node is available) ---
  COPY package.json pnpm-lock.yaml ./
  RUN pnpm install --frozen-lockfile --prod=false
  
  # --- App sources --------------------------------------------
  COPY . .
  
  # --- Runtime -------------------------------------------------
  ENV NODE_ENV=production
  ENV HOST=0.0.0.0
  ENV PORT=3000
  
  # Run as non-root
  USER node
  
  EXPOSE 3000
  
  # Start via your package.json "start" script (e.g. `ts-node src/index.ts`)
  # If you use ESM: set "type":"module" and make start script: `node --loader ts-node/esm src/index.ts`
  # If you use TS path aliases, add `-r tsconfig-paths/register` in your start script.
  ENTRYPOINT ["dumb-init", "--"]
  CMD ["pnpm", "start"]
  