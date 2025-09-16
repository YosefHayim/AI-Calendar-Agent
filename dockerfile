# --- Base ----------------------------------------------------
  FROM node:latest
  WORKDIR .

  # --- Install deps (keeps devDeps so ts-node is available) ---
  RUN npm install
  
  # --- App sources --------------------------------------------
  COPY . .
  
  # --- Runtime -------------------------------------------------
  ENV NODE_ENV=production
  
  EXPOSE 8080
  
  CMD ["npm", "run", "start"]
  