# ---- Builder ----
  FROM node:latest AS builder
  WORKDIR /app
  
  # Faster, reproducible installs
  COPY package*.json ./
  RUN pnpm i
  
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

  # Adjust if your server listens on a different port
  EXPOSE 3000
  
  # Use Doppler at runtime (requires DOPPLER_TOKEN provided at container start)
  CMD ["npm", "run", "start"]