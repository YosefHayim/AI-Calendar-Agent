FROM node:latest
WORKDIR /app

# Install only prod deps
COPY package*.json ./
RUN npm install

# Copy source (node_modules from host is ignored by .dockerignore)
COPY . .

# Keep ts-node lighter in prod
ENV TS_NODE_TRANSPILE_ONLY=1
ENV TS_NODE_COMPILER_OPTIONS='{"sourceMap":false}'
ENV NODE_OPTIONS=--max-old-space-size=1024

EXPOSE 3000
CMD ["npm", "start"]
