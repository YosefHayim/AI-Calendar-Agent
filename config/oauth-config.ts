import { google } from "googleapis";
import { CONFIG } from "./env-config";
import CREDENTIALS from "../CREDENTIALS.json";

export const oauth2Client = new google.auth.OAuth2(CONFIG.client_id, CONFIG.client_secret, CONFIG.redirect_url);
oauth2Client.setCredentials(CREDENTIALS);

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
