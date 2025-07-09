import CREDENTIALS from "../CREDENTIALS.json" with { type: 'json' };;
import dotenv from "dotenv";
import { google } from "googleapis";
import path from "path";
import { setDefaultOpenAIKey } from "@openai/agents";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
export const CREDENTIALS_FILE_PATH = path.resolve(process.cwd(), "CREDENTIALS.JSON");

export const CONFIG = {
  open_ai_api_key: process.env.OPEN_API_KEY,
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  google_api_key: process.env.GOOGLE_API_KEY,
  redirect_url: process.env.REDIRECT_URL,
  port: process.env.PORT,
  telegram_access_token: process.env.TELEGRAM_BOT_ACCESS_TOKEN,
};
export const oauth2Client = new google.auth.OAuth2(CONFIG.client_id, CONFIG.client_secret, CONFIG.redirect_url);

(() => {
  if (!CONFIG.open_ai_api_key) {
    throw new Error("OpenAI API key is not set in the environment variables.");
  } else {
    console.log("OpenAI API key is set.");
  }
  setDefaultOpenAIKey(CONFIG.open_ai_api_key!);
})();

oauth2Client.setCredentials({
  access_token: CREDENTIALS?.access_token,
  token_type: "Bearer",
  refresh_token: CREDENTIALS?.refresh_token,
  expiry_date: CREDENTIALS?.expiry_date,
});

export const calendar = google.calendar({ version: "v3", auth: oauth2Client });

export const requestConfigBase = {
  calendarId: "primary",
  auth: oauth2Client,
  sendUpdates: "all",
  supportsAttachments: true,
};

export const SCOPES = [
  "https://www.googleapis.com/auth/calendar.app.created",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.calendarlist",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  "https://www.googleapis.com/auth/calendar.events.owned.readonly",
  "https://www.googleapis.com/auth/calendar.events.owned",
  "https://www.googleapis.com/auth/calendar.freebusy",
];
