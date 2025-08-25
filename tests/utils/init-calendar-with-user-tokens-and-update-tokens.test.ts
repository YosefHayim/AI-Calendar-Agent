import { expect, jest, test } from '@jest/globals';
import type { TokensProps } from '@/types';

const setCredentials = jest.fn();
const getAccessToken = jest.fn();
jest.mock('@/config/root-config', () => ({
  OAUTH2CLIENT: {
    setCredentials,
    getAccessToken,
    _clientId: 'client-123',
  },
}));

const updateTokensOfUser = jest.fn();
jest.mock('@/utils/update-tokens-of-user', () => ({
  updateTokensOfUser: (...args: unknown[]) => updateTokensOfUser(...args),
}));

const googleCalendarMock = jest.fn();
jest.mock('googleapis', () => ({
  google: {
    calendar: (...args: unknown[]) => googleCalendarMock(...args),
  },
}));

import { OAUTH2CLIENT } from '@/config/root-config';
import { initCalendarWithUserTokensAndUpdateTokens } from '@/utils/init-calendar-with-user-tokens-and-update-tokens';

describe('initCalendarWithUserTokensAndUpdateTokens', () => {
  const baseTokens: TokensProps = {
    access_token: 'acc',
    refresh_token: 'ref',
    scope: 'scope',
    token_type: 'Bearer',
    expiry_date: Date.now() + 3_600_000,
  } as unknown;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sets credentials, refreshes access token, updates stored tokens, returns calendar client', async () => {
    getAccessToken.mockResolvedValue({ token: 'new-access-token' });
    const calendarInstance = { events: { list: jest.fn() } };
    googleCalendarMock.mockReturnValue(calendarInstance);

    const res = await initCalendarWithUserTokensAndUpdateTokens(baseTokens);

    expect(setCredentials).toHaveBeenCalledWith(baseTokens);
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(updateTokensOfUser).toHaveBeenCalledWith(baseTokens, { token: 'new-access-token' });
    expect(googleCalendarMock).toHaveBeenCalledWith({ version: 'v3', auth: OAUTH2CLIENT });
    expect(res).toBe(calendarInstance);
  });

  test('does not call updateTokensOfUser when no new token is returned', async () => {
    getAccessToken.mockResolvedValue(undefined);
    const calendarInstance = { events: {} };
    googleCalendarMock.mockReturnValue(calendarInstance);

    const res = await initCalendarWithUserTokensAndUpdateTokens(baseTokens);

    expect(setCredentials).toHaveBeenCalledWith(baseTokens);
    expect(updateTokensOfUser).not.toHaveBeenCalled();
    expect(res).toBe(calendarInstance);
  });

  test('throws formatted invalid_grant error with response data', async () => {
    const err = Object.assign(new Error('boom'), {
      response: { data: { error: 'invalid_grant', error_description: 'Token expired or revoked' } },
    });
    getAccessToken.mockRejectedValue(err);

    await expect(initCalendarWithUserTokensAndUpdateTokens(baseTokens)).rejects.toThrow('invalid_grant: invalid_grant - Token expired or revoked');

    expect(updateTokensOfUser).not.toHaveBeenCalled();
    expect(googleCalendarMock).not.toHaveBeenCalled();
  });

  test('throws formatted invalid_grant error with generic message when no response data', async () => {
    getAccessToken.mockRejectedValue(new Error('network down'));

    await expect(initCalendarWithUserTokensAndUpdateTokens(baseTokens)).rejects.toThrow('invalid_grant: network down');

    expect(updateTokensOfUser).not.toHaveBeenCalled();
    expect(googleCalendarMock).not.toHaveBeenCalled();
  });
});
