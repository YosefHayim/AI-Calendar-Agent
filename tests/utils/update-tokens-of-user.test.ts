import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { TokensProps } from '@/types';

// Shared mocks used by the module mock and the tests
const from = jest.fn();
const update = jest.fn();
const eq = jest.fn();

jest.mock('@/config/root-config', () => ({
  SUPABASE: { from },
}));

import { SUPABASE } from '@/config/root-config';
import { updateTokensOfUser } from '@/utils/update-tokens-of-user';

describe('updateTokensOfUser', () => {
  const oldTokens: TokensProps = {
    email: 'user@example.com',
    access_token: 'old-access',
    refresh_token: 'ref',
    scope: 'scope',
    token_type: 'Bearer',
    expiry_date: Date.now() + 60_000,
  } as any;

  const newTokenPayload = {
    token: 'new-access',
    expiry_date: Date.now() + 3_600_000,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Chain: from('table') -> { update } ; update(body) -> { eq } ; eq(...) -> Promise
    from.mockReturnValue({ update });
    update.mockReturnValue({ eq });
  });

  it('updates Supabase row and returns merged tokens', async () => {
    eq.mockResolvedValue({ error: null });

    const result = await updateTokensOfUser(oldTokens, newTokenPayload);

    expect(SUPABASE.from).toHaveBeenCalledWith('calendars_of_users');
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
    expect(Number.isNaN(Date.parse(result.updated_at as any))).toBe(false);
  });

  it('throws when Supabase returns an error', async () => {
    eq.mockResolvedValue({ error: { message: 'db down' } });
    await expect(updateTokensOfUser(oldTokens, newTokenPayload)).rejects.toThrow('Failed to update Supabase tokens: db down');
  });

  it('handles missing new token (sets access_token to undefined)', async () => {
    eq.mockResolvedValue({ error: null });

    const res = await updateTokensOfUser(oldTokens, { expiry_date: 123 } as any);

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

    const noEmailOld = { ...oldTokens, email: undefined } as any;
    await updateTokensOfUser(noEmailOld, newTokenPayload);

    expect(eq).toHaveBeenCalledWith('email', '');
  });
});
