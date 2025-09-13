# ---- Builder ----
  FROM node:22-slim AS builder
  WORKDIR /app
  
  # Faster, reproducible installs
  COPY package*.json ./
  RUN npm ci
  
  # Copy the rest and build
  COPY . .
  RUN npm run build
  
  # ---- Runtime ----
  FROM node:22-slim AS runtime
  WORKDIR /app
  
  # Install Doppler (runtime only; inject secrets at start)
  RUN apt-get update -y && apt-get install -y curl ca-certificates && rm -rf /var/lib/apt/lists/* \
    && curl -Ls https://cli.doppler.com/install.sh | sh
  
  ENV NODE_ENV=production
  
  # Only production deps
  COPY package*.json ./
  RUN npm ci --omit=dev
  
  # Bring compiled JS
  COPY --from=builder /app/dist ./dist
  
  # Optional: keep minimal artifacts you actually need at runtime
  # COPY --from=builder /app/database.types.ts ./  # if used at runtime
  
  # Security hardening
  RUN useradd --create-home --uid 10001 appuser
  USER appuser
  
  # Adjust if your server listens on a different port
  EXPOSE 3000
  
  # Use Doppler at runtime (requires DOPPLER_TOKEN provided at container start)
  CMD ["doppler", "run", "--", "node", "dist/app.js"]
  