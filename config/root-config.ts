import { Database } from "../database.types";
import { GOOGLE_CALENDAR_SCOPES } from "../types";
import { SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import { google } from "googleapis";
import path from "path";
import { setDefaultOpenAIKey } from "@openai/agents";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const CONFIG = {
  open_ai_api_key: process.env.OPEN_API_KEY,
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  google_api_key: process.env.GOOGLE_API_KEY,
  redirect_url: process.env.REDIRECT_URL,
  port: process.env.PORT,
  telegram_access_token: process.env.TELEGRAM_BOT_ACCESS_TOKEN,
  supabase_url: process.env.SUPABASE_URL,
  supabase_service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

if (!CONFIG.open_ai_api_key) {
  throw new Error("OpenAI API key is not set in environment variables.");
}
setDefaultOpenAIKey(CONFIG.open_ai_api_key);

const credentialsPath = path.resolve(__dirname, "../credentials.json");

export const supabase = new SupabaseClient<Database>(CONFIG.supabase_url!, CONFIG.supabase_service_role_key!);

let credentials: {
  access_token: string;
  expiry_date: number;
  token_type: string;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
};

if (fs.existsSync(credentialsPath)) {
  credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
} else {
  credentials = {
    access_token: "",
    expiry_date: 0,
    token_type: "Bearer",
    refresh_token: "",
    refresh_token_expires_in: 0,
    scope: "",
  };
  fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
}

export const parsedCredentials = credentials;
export const credentials_file_path = credentialsPath;

export const oauth2Client = new google.auth.OAuth2(CONFIG.client_id, CONFIG.client_secret, CONFIG.redirect_url);

oauth2Client.setCredentials({
  access_token: credentials.access_token,
  token_type: "Bearer",
  expiry_date: credentials.expiry_date,
});

export const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
});

export const requestConfigBase = {
  calendarId: "primary",
  auth: oauth2Client,
  sendUpdates: "all",
  supportsAttachments: true,
};

export const SCOPES = Object.values(GOOGLE_CALENDAR_SCOPES);
