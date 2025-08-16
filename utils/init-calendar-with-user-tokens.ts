import { OAUTH2CLIENT } from '@/config/root-config';
import type { TokensProps } from '@/types';
import { google } from 'googleapis';

export function initCalendarWithUserTokens(tokens: TokensProps) {
  OAUTH2CLIENT.setCredentials(tokens);
  return google.calendar({ version: 'v3', auth: OAUTH2CLIENT });
}
