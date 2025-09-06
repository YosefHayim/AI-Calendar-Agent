// update-tokens-of-user.test.ts
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { TokensProps } from '@/types';

// Minimal types to make the Supabase call-chain and payloads fully typed.
type SupabaseError = { message: string };
type SupabaseResult = { error: null } | { error: SupabaseError };

interface EqFn {
  (column: string, value: string): Promise<SupabaseResult>;
}
interface UpdateFn {
  (body: Record<string, unknown>): { eq: EqFn };
}
interface FromFn {
  (table: string): { update: UpdateFn };
}

// Strongly-typed Jest mocks for the chained API: from('table')->update(body)->eq(...)
const from: jest.MockedFunction<FromFn> = jest.fn();
const update: jest.MockedFunction<UpdateFn> = jest.fn();
const eq: jest.MockedFunction<EqFn> = jest.fn();

jest.mock('@/config/root-config', () => ({
  SUPABASE: { from },
}));

import { SUPABASE } from '@/config/root-config';
import { updateTokensOfUser } from '@/utils/update-tokens-of-user';

// Type for the new token payload accepted by updateTokensOfUser in these tests.
type NewTokenPayload = {
  token?: string;
  expiry_date?: number;
};

describe('updateTokensOfUser', () => {
  const oldTokens: TokensProps = {
    email: 'user@example.com',
    access_token: 'old-access',
    refresh_token: 'ref',
    scope: 'scope',
    token_type: 'Bearer',
    expiry_date: Date.now() + 60_000,
  } as unknown as TokensProps;

  const newTokenPayload: NewTokenPayload = {
    token: 'new-access',
    expiry_date: Date.now() + 3_600_000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Wire the chain each time
    from.mockReturnValue({ update });
    update.mockReturnValue({ eq });
  });

  it('updates Supabase row and returns merged tokens', async () => {
    eq.mockResolvedValue({ error: null });

    const result = await updateTokensOfUser(oldTokens, newTokenPayload);

    expect(SUPABASE.from).toHaveBeenCalledWith('user_calendar_tokens');
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        access_token: 'new-access',
        expiry_date: newTokenPayload.expiry_date,
        updated_at: expect.any(String),
      })
    );
    expect(eq).toHaveBeenCalledWith('email', 'user@example.com');

    expect(result.email).toBe('user@example.com');
    expect(result.access_token).toBe('new-access');
    expect(result.expiry_date).toBe(newTokenPayload.expiry_date);
    expect(typeof result.updated_at).toBe('string');
    expect(Number.isNaN(Date.parse(result.updated_at as unknown as string))).toBe(false);
  });

  it('throws when Supabase returns an error', async () => {
    eq.mockResolvedValue({ error: { message: 'db down' } });

    await expect(updateTokensOfUser(oldTokens, newTokenPayload))
      .rejects
      .toThrow('Failed to update Supabase tokens: db down');
  });

  it('handles missing new token (sets access_token to undefined)', async () => {
    eq.mockResolvedValue({ error: null });

    const res = await updateTokensOfUser(oldTokens, { expiry_date: 123 } as NewTokenPayload);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        access_token: undefined,
        expiry_date: 123,
      })
    );
    expect(res.access_token).toBeUndefined();
    expect(res.expiry_date).toBe(123);
  });

  it('filters by empty email when oldTokens.email is missing', async () => {
    eq.mockResolvedValue({ error: null });

    const noEmailOld = { ...oldTokens, email: undefined } as unknown as TokensProps;
    await updateTokensOfUser(noEmailOld, newTokenPayload);

    expect(eq).toHaveBeenCalledWith('email', '');
  });
});
