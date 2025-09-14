FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install Doppler CLI (for secrets at runtime)
RUN apk add --no-cache curl \
  && curl -Ls https://cli.doppler.com/install.sh | sh

# Copy manifest(s) only and install prod deps without strict lockfile checks
COPY package*.json ./
# Use npm install, not npm ci, because the lockfile is inconsistent
RUN npm install --omit=dev --no-audit --no-fund --legacy-peer-deps

# Now copy the rest of the source (node_modules is ignored by .dockerignore)
COPY . .

# Keep ts-node lighter in prod; increase heap to survive ts-node/ESM overhead
ENV TS_NODE_TRANSPILE_ONLY=1
ENV TS_NODE_COMPILER_OPTIONS='{"sourceMap":false}'
ENV NODE_OPTIONS=--max-old-space-size=1024

EXPOSE 3000

# If you use Doppler, run via doppler; otherwise fall back to npm start
# Comment/uncomment the CMD you want.

# With Doppler (expects DOPPLER_TOKEN env at runtime)
# CMD ["doppler", "run", "--", "npm", "start"]

# Without Doppler
CMD ["npm", "start"]
