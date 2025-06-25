import { CONFIG } from './env-config';
import CREDENTIALS from '../CREDENTIALS.json';
import { google } from 'googleapis';

export const oauth2Client = new google.auth.OAuth2(
  CONFIG.client_id,
  CONFIG.client_secret,
  CONFIG.redirect_url,
);
oauth2Client.setCredentials({
  access_token: CREDENTIALS.access_token,
  refresh_token: CREDENTIALS.refresh_token,
  token_type: 'Bearer',
  expiry_date: CREDENTIALS.expiry_date,
});

export const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export const SCOPES = [
  'https://www.googleapis.com/auth/calendar.app.created',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.calendarlist',
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
  'https://www.googleapis.com/auth/calendar.events.owned.readonly',
  'https://www.googleapis.com/auth/calendar.events.owned',
  'https://www.googleapis.com/auth/calendar.freebusy',
];
