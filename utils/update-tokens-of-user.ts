import { SUPABASE } from '@/config/root-config';
import type { TokensProps } from '@/types';
import { asyncHandler } from './async-handlers';

export const updateTokensOfUser = asyncHandler(async (oldTokens: TokensProps, newTokens: TokensProps & { token?: string | null }) => {
  const updatedTokens = {
    ...oldTokens,
    access_token: newTokens.token,
    expiry_date: newTokens.expiry_date,
    updated_at: new Date().toISOString(),
  };
  const { error } = await SUPABASE.from('calendars_of_users')
    .update(updatedTokens)
    .eq('email', oldTokens.email || '');
  if (error) {
    throw new Error(`Failed to update Supabase tokens: ${error.message}`);
  }
  return updatedTokens;
});
