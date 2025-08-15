import type { User } from '@supabase/supabase-js';
import { SUPABASE } from '@/config/root-config';
import { asyncHandler } from './async-handlers';
import { TOKEN_FIELDS } from './storage';

export const getUserCalendarTokens = asyncHandler(
  async (matchBy: 'email', user?: User) => {
    if (!user || typeof user.email !== 'string') {
      return null;
    }

    const { data, error: _error } = await SUPABASE.from('calendars_of_users')
      .select(TOKEN_FIELDS)
      .eq(matchBy, user.email);
    return data?.[0] || null;
  }
);
