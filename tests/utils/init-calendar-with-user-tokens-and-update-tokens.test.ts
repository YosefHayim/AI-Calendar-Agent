import { expect, jest, test, describe, beforeEach, afterEach } from '@jest/globals';
import type { TokensProps } from '@/types';

type AccessToken = { token: string };
type CalendarInit = { version: 'v3'; auth: unknown };
type CalendarClient = { events: { list?: jest.Mock } };

const setCredentials: jest.MockedFunction<(t: TokensProps) => void> = jest.fn();
const getAccessToken: jest.MockedFunction<() => Promise<AccessToken | undefined>> = jest.fn();

jest.mock('@/config/root-config', () => ({
  OAUTH2CLIENT: {
    setCredentials,
    getAccessToken,
    _clientId: 'client-123',
  },
}));

const updateTokensOfUser: jest.MockedFunction<
  (prev: TokensProps, next: AccessToken) => Promise<void> | void
> = jest.fn();

jest.mock('@/utils/update-tokens-of-user', () => ({
  updateTokensOfUser: (...args: Parameters<typeof updateTokensOfUser>) =>
    updateTokensOfUser(...args),
}));

const googleCalendarMock: jest.MockedFunction<(args: CalendarInit) => CalendarClient> = jest.fn();

jest.mock('googleapis', () => ({
  google: {
    calendar: (...args: Parameters<typeof googleCalendarMock>) =>
      googleCalendarMock(...args),
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
  };

  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('sets credentials, refreshes access token, updates stored tokens, returns calendar client', async () => {
    getAccessToken.mockResolvedValue({ token: 'new-access-token' });
    const calendarInstance: CalendarClient = { events: { list: jest.fn() } };
    googleCalendarMock.mockReturnValue(calendarInstance);

    const res = await initCalendarWithUserTokensAndUpdateTokens(baseTokens);

    expect(setCredentials).toHaveBeenCalledWith(baseTokens);
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(updateTokensOfUser).toHaveBeenCalledWith(baseTokens, { token: 'new-access-token' });
    expect(googleCalendarMock).toHaveBeenCalledWith({ version: 'v3', auth: OAUTH2CLIENT });
    expect(res).toBe(calendarInstance);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('does not call updateTokensOfUser when no new token is returned', async () => {
    getAccessToken.mockResolvedValue(undefined);
    const calendarInstance: CalendarClient = { events: {} };
    googleCalendarMock.mockReturnValue(calendarInstance);

    const res = await initCalendarWithUserTokensAndUpdateTokens(baseTokens);

    expect(setCredentials).toHaveBeenCalledWith(baseTokens);
    expect(updateTokensOfUser).not.toHaveBeenCalled();
    expect(res).toBe(calendarInstance);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('throws formatted invalid_grant error with response data and logs once', async () => {
    const err = Object.assign(new Error('boom'), {
      response: { data: { error: 'invalid_grant', error_description: 'Token expired or revoked' } },
    });
    getAccessToken.mockRejectedValue(err);

    await expect(
      initCalendarWithUserTokensAndUpdateTokens(baseTokens)
    ).rejects.toThrow('invalid_grant: invalid_grant - Token expired or revoked');

    expect(updateTokensOfUser).not.toHaveBeenCalled();
    expect(googleCalendarMock).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('OAuth invalid_grant', {
      msg: 'invalid_grant',
      desc: 'Token expired or revoked',
      client_id: 'client-123',
    });
  });

  test('throws formatted invalid_grant error with generic message when no response data and logs once', async () => {
    getAccessToken.mockRejectedValue(new Error('network down'));

    await expect(
      initCalendarWithUserTokensAndUpdateTokens(baseTokens)
    ).rejects.toThrow('invalid_grant: network down');

    expect(updateTokensOfUser).not.toHaveBeenCalled();
    expect(googleCalendarMock).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('OAuth invalid_grant', {
      msg: 'network down',
      desc: '',
      client_id: 'client-123',
    });
  });
});
