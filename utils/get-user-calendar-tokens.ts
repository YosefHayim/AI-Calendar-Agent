import { SUPABASE } from '@/config/root-config';
import type { TokensProps } from '@/types';
import { asyncHandler } from './async-handlers';
import { TOKEN_FIELDS } from './storage';

export const fetchCredentialsByEmail = asyncHandler(async (email: string): Promise<TokensProps> => {
  const { data, error } = await SUPABASE.from('calendars_of_users').select(TOKEN_FIELDS).eq('email', email);

  if (error || !data?.length) {
    throw new Error(`Could not fetch credentials for ${email}: ${error?.message || 'No data'}`);
  }

  return data[0] as TokensProps;
});
