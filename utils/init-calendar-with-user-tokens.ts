import { google } from 'googleapis';
import { OAUTH2CLIENT } from '@/config/root-config';
import type { tokens } from '@/types';
import { asyncHandler } from './async-handlers';

export const initCalendarWithUserTokens = asyncHandler(
  async (tokens: tokens) => {
    OAUTH2CLIENT.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: OAUTH2CLIENT });
    return calendar;
  }
);
