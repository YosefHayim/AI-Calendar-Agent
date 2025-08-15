import { google } from 'googleapis';
import { OAUTH2CLIENT } from '@/config/root-config';
import type { TokensProps } from '@/types';

export function initCalendarWithUserTokens(tokens: TokensProps) {
  OAUTH2CLIENT.setCredentials(tokens);
  return google.calendar({ version: 'v3', auth: OAUTH2CLIENT });
}
