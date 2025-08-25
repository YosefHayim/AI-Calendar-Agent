import { expect, jest, test, describe, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import { PROVIDERS, STATUS_RESPONSE } from '@/types';

interface SignInArgs {
  provider: PROVIDERS; 
  options: {
    redirectTo: string;
    scopes: string;
    queryParams: {
      access_type: string;
      prompt: string;
    };
  };
}
interface SignInResult {
  data: { url: string | null };
  error: Error | null;
}
type SignInWithOAuthFn = (args: SignInArgs) => Promise<SignInResult>;

// Shared mocks
const signInWithOAuth: jest.MockedFunction<SignInWithOAuthFn> = jest.fn();
const CONFIG = {
  node_env: 'development',
  redirect_url_prod: 'https://prod.example.com/callback',
  redirect_url_dev: 'http://localhost:3000/callback',
};

jest.mock('@/config/root-config', () => ({
  CONFIG,
  SCOPES_STRING: 'openid email profile',
  SUPABASE: {
    auth: {
      signInWithOAuth: (...args: Parameters<SignInWithOAuthFn>) =>
        signInWithOAuth(...args),
    },
  },
}));

const sendR: jest.MockedFunction<
  (res: Response, status: number, msg: string, err?: unknown) => void
> = jest.fn();

jest.mock('@/utils/send-response', () => ({
  __esModule: true,
  default: (...args: Parameters<typeof sendR>) => sendR(...args),
}));

import { CONFIG as LIVE_CONFIG } from '@/config/root-config';
import { thirdPartySignInOrSignUp } from '@/utils/third-party-signup-signin-supabase';

describe('thirdPartySignInOrSignUp', () => {
  const provider = PROVIDERS.GOOGLE;

  const makeRes = (): Response =>
    ({
      redirect: jest.fn(),
    }) as unknown as Response;

  const makeReq = (): Request => ({} as Request);

  beforeEach(() => {
    jest.clearAllMocks();
    (LIVE_CONFIG as any).node_env = 'development';
  });

  test('redirects when Supabase returns a URL', async () => {
    const res = makeRes();
    signInWithOAuth.mockResolvedValue({
      data: { url: 'https://supabase.example/redirect' },
      error: null,
    });

    await thirdPartySignInOrSignUp(makeReq(), res, provider);

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider,
      options: {
        redirectTo: LIVE_CONFIG.redirect_url_dev!, 
        scopes: 'openid email profile',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

    expect(res.redirect).toHaveBeenCalledWith('https://supabase.example/redirect');
    expect(sendR).not.toHaveBeenCalled();
  });

  test('uses production redirect URL when node_env is production', async () => {
    (LIVE_CONFIG as any).node_env = 'production';
    const res = makeRes();

    signInWithOAuth.mockResolvedValue({
      data: { url: 'https://supabase.example/redirect' },
      error: null,
    });

    await thirdPartySignInOrSignUp(makeReq(), res, provider);

    const args = signInWithOAuth.mock.calls[0][0];
    expect(args.options.redirectTo).toBe(LIVE_CONFIG.redirect_url_prod);
  });

  test('calls sendR with 500 when Supabase returns an error', async () => {
    const res = makeRes();
    const error = new Error('auth failed');
    signInWithOAuth.mockResolvedValue({
      data: { url: null },
      error,
    });

    await thirdPartySignInOrSignUp(makeReq(), res, provider);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(sendR).toHaveBeenCalledWith(
      res,
      STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
      'Failed to sign up user.',
      error
    );
  });

  test('no-op when neither url nor error returned', async () => {
    const res = makeRes();
    signInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: null,
    });

    await thirdPartySignInOrSignUp(makeReq(), res, provider);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(sendR).not.toHaveBeenCalled();
  });
});
