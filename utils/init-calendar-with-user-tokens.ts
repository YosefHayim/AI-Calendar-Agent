import { google } from 'googleapis';
import { OAUTH2CLIENT, SUPABASE } from '@/config/root-config';
import type { TokensProps } from '@/types';
import { asyncHandler } from './async-handlers';

export const initCalendarWithUserTokens = asyncHandler(async (tokens: TokensProps) => {
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
    const updatedTokens = {
      ...tokens,
      access_token: newTokens.token,
      expiry_date: OAUTH2CLIENT.credentials.expiry_date,
      updated_at: new Date().toISOString(),
    };

    const { error } = await SUPABASE.from('calendars_of_users')
      .update(updatedTokens)
      .eq('email', tokens.email || '');

    if (error) {
      console.error('Failed to update Supabase tokens', error);
    }
  }

  return google.calendar({ version: 'v3', auth: OAUTH2CLIENT });
});
