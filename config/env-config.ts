import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  open_ai_api_key: process.env.OPEN_API_KEY,
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  google_api_key: process.env.GOOGLE_API_KEY,
  redirect_url: process.env.REDIRECT_URL,
  port: process.env.PORT,
};
