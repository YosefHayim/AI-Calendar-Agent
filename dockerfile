FROM node:22-alpine

# Create work directory
WORKDIR /app

# Copy only package manager files first (better caching)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN corepack enable && pnpm install --frozen-lockfile

# Copy the rest of the project
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port for App Runner / local docker run
EXPOSE 8080

# Start the app
CMD ["pnpm", "start"]
