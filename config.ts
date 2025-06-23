import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  open_ai_api_key: process.env.OPEN_API_KEY,
  port: process.env.PORT,
};
