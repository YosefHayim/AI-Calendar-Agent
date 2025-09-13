# Use a Node.js base image
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if you use npm) or yarn.lock (if you use yarn)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build # Assuming you have a "build" script in your package.json that runs tsc

# Expose the port your application listens on
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "run",'start'] # Assuming your compiled entry point is at dist/index.js