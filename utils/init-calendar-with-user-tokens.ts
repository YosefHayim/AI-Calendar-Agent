import { google } from 'googleapis';
import { OAUTH2CLIENT } from '@/config/root-config';
import type { TokensProps } from '@/types';

export const initCalendarWithUserTokens = async (tokens: TokensProps) => {
  OAUTH2CLIENT.setCredentials(tokens);

  await OAUTH2CLIENT.getAccessToken();

  return google.calendar({ version: 'v3', auth: OAUTH2CLIENT });
};
