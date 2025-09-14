FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000
CMD ["npm","run","start"]  # ensure "start" runs ts-node or next dev with -H 0.0.0.0
