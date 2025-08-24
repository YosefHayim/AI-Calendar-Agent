import { google } from 'googleapis';
import { OAUTH2CLIENT } from '@/config/root-config';
import type { TokensProps } from '@/types';
import { asyncHandler } from './async-handlers';
import { updateTokensOfUser } from './update-tokens-of-user';

export const initCalendarWithUserTokensAndUpdateTokens = asyncHandler(async (tokens: TokensProps) => {
  OAUTH2CLIENT.setCredentials(tokens);

  const newTokens = await OAUTH2CLIENT.getAccessToken().catch((e) => {
    const data = e?.response?.data;
    const msg = data?.error || e?.message || 'unknown';
    const desc = data?.error_description || '';
    console.error('OAuth invalid_grant', {
      msg,
      desc,
      client_id: OAUTH2CLIENT._clientId,
    });
    throw new Error(`invalid_grant: ${msg}${desc ? ` - ${desc}` : ''}`);
  });

  if (newTokens?.token) {
    await updateTokensOfUser(tokens, newTokens);
  }

  return google.calendar({ version: 'v3', auth: OAUTH2CLIENT });
});
