FROM node:latest
RUN curl -Ls https://cli.doppler.com/install.sh | sh
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .

CMD ["npm", "run", "get-env"]
