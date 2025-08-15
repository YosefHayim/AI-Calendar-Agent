import path from 'node:path';
import { SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import type { Database } from '@/database.types';
import { GOOGLE_CALENDAR_SCOPES } from '@/types';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const CONFIG = {
  open_ai_api_key: process.env.OPEN_API_KEY,
  base_url: process.env.BASE_URL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  node_env: process.env.NODE_ENV,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  google_api_key: process.env.GOOGLE_API_KEY,
  redirect_url_dev: process.env.REDIRECT_URL,
  redirect_url_prod: process.env.REDIRECT_URL_PROD,
  port: process.env.PORT,
  telegram_access_token: process.env.TELEGRAM_BOT_ACCESS_TOKEN,
  supabase_url: process.env.SUPABASE_URL,
  supabase_service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export const SUPABASE = new SupabaseClient<Database>(CONFIG.supabase_url || '', CONFIG.supabase_service_role_key || '');

export const OAUTH2CLIENT = new google.auth.OAuth2(CONFIG.client_id, CONFIG.client_secret, CONFIG.redirect_url_dev);

export const CALENDAR = google.calendar({
  version: 'v3',
  auth: OAUTH2CLIENT,
});

export const requestConfigBase = {
  calendarId: 'primary',
  sendUpdates: 'all',
  supportsAttachments: true,
};

export const SCOPES = Object.values(GOOGLE_CALENDAR_SCOPES);
export const SCOPES_STRING = Object.values(GOOGLE_CALENDAR_SCOPES).join(' ');
