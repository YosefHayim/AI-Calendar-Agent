FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=dev
ENV PORT=3000
EXPOSE 3000
CMD ["npm","run","start"]
