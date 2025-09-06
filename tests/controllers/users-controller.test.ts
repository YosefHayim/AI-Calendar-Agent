// tests/controllers/users-route.test.ts
import type { NextFunction, Request, Response } from 'express';
import { STATUS_RESPONSE, PROVIDERS } from '@/types';

jest.mock('jsonwebtoken', () => ({ decode: jest.fn() }));

jest.mock('@/config/root-config', () => ({
  CONFIG: { redirect_url_dev: 'http://localhost/callback' },
  SCOPES: ['scope-a', 'scope-b'],
  OAUTH2CLIENT: {
    generateAuthUrl: jest.fn(),
    getToken: jest.fn(),
  },
  SUPABASE: {
    from: jest.fn(),
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      verifyOtp: jest.fn(),
    },
  },
}));

// execute inner async handler immediately, passing next through unchanged
jest.mock('@/utils/async-handlers', () => ({
  reqResAsyncHandler:
    (fn: any) =>
    (req: Request, res: Response, next?: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next),
}));

jest.mock('@/utils/send-response', () => jest.fn());
jest.mock('@/utils/third-party-signup-signin-supabase', () => ({
  thirdPartySignInOrSignUp: jest.fn(),
}));

import jwt from 'jsonwebtoken';
import sendR from '@/utils/send-response';
import { thirdPartySignInOrSignUp } from '@/utils/third-party-signup-signin-supabase';
import { OAUTH2CLIENT, SUPABASE } from '@/config/root-config';
import { userController } from '@/controllers/users-controller';

const mockRes = () => {
  const res: Partial<Response> = {};
  res.redirect = jest.fn();
  return res as Response;
};

const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({
    headers: {},
    query: {},
    body: {},
    ...overrides,
  } as unknown as Request);

const mockNext = jest.fn() as unknown as NextFunction;

// ---- Supabase builder helpers ----

// update().eq().select() -> Promise<{data,error}>
const mockUpdateEqSelect = (table: string, result: any) => {
  (SUPABASE.from as jest.Mock).mockImplementationOnce((t: string) => {
    expect(t).toBe(table);
    const builder: any = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(result),
    };
    return builder;
  });
};

// select().eq() -> Promise<{data,error}>
const mockSelectEq = (table: string, result: any) => {
  (SUPABASE.from as jest.Mock).mockImplementationOnce((t: string) => {
    expect(t).toBe(table);
    const afterSelect = {
      eq: jest.fn().mockResolvedValue(result),
    };
    const builder: any = {
      select: jest.fn().mockReturnValue(afterSelect),
    };
    return builder;
  });
};

// update().eq() -> Promise<{error?: any}>
const mockUpdateEq = (table: string, result: any) => {
  (SUPABASE.from as jest.Mock).mockImplementationOnce((t: string) => {
    expect(t).toBe(table);
    const builder: any = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue(result),
    };
    return builder;
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('generateAuthGoogleUrl', () => {
  it('returns URL via sendR when no code and request from Postman', async () => {
    (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValueOnce('https://accounts.google.com/o/oauth2/auth?x=1');

    const req = mockReq({ headers: { 'user-agent': 'PostmanRuntime/7.32.2' } });
    const res = mockRes();

    await userController.generateAuthGoogleUrl(req, res, mockNext);

    expect(OAUTH2CLIENT.generateAuthUrl).toHaveBeenCalledWith({
      access_type: 'offline',
      scope: ['scope-a', 'scope-b'],
      prompt: 'consent',
      include_granted_scopes: true,
      redirect_uri: 'http://localhost/callback',
    });
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.SUCCESS, expect.stringContaining('https://accounts.google.com'));
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('redirects to Google when no code and not Postman', async () => {
    (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValueOnce('https://accounts.google.com/o/oauth2/auth?y=2');

    const req = mockReq({ headers: { 'user-agent': 'Mozilla/5.0' } });
    const res = mockRes();

    await userController.generateAuthGoogleUrl(req, res, mockNext);

    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('https://accounts.google.com'));
    expect(sendR).not.toHaveBeenCalled();
  });

  it('updates tokens in DB and responds success', async () => {
    const req = mockReq({ query: { code: 'auth-code' } });
    const res = mockRes();

    (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValueOnce({
      tokens: {
        id_token: 'id.token',
        refresh_token: 'r',
        refresh_token_expires_in: 1234,
        expiry_date: 999999,
        access_token: 'a',
        token_type: 'Bearer',
        scope: 'email profile',
      },
    });
    (jwt.decode as jest.Mock).mockReturnValueOnce({ email: 'u@test.com' });

    mockUpdateEqSelect('user_calendar_tokens', { data: [{ id: 1 }], error: null });

    await userController.generateAuthGoogleUrl(req, res, mockNext);

    expect(sendR).toHaveBeenCalledWith(
      res,
      STATUS_RESPONSE.SUCCESS,
      'Tokens has been updated successfully.',
      expect.objectContaining({ data: expect.any(Array) }),
    );
  });

  it('handles Supabase update error', async () => {
    const req = mockReq({ query: { code: 'auth-code' } });
    const res = mockRes();

    (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValueOnce({ tokens: { id_token: 'x' } });
    (jwt.decode as jest.Mock).mockReturnValueOnce({ email: 'e@test.com' });

    mockUpdateEqSelect('user_calendar_tokens', { data: null, error: new Error('db error') });

    await userController.generateAuthGoogleUrl(req, res, mockNext);

    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'Failed to store new tokens.', expect.any(Error));
  });

  it('handles token exchange failure', async () => {
    const req = mockReq({ query: { code: 'bad' } });
    const res = mockRes();

    (OAUTH2CLIENT.getToken as jest.Mock).mockRejectedValueOnce(new Error('oauth down'));

    await userController.generateAuthGoogleUrl(req, res, mockNext);

    expect(sendR).toHaveBeenCalledWith(
      res,
      STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
      'Failed to process OAuth token exchange.',
      expect.any(Error),
    );
  });
});

describe('signUpUserReg', () => {
  it('validates required body (controller does not return early)', async () => {
    (SUPABASE.auth.signUp as jest.Mock).mockResolvedValueOnce({ data: null, error: null });

    const req = mockReq({ body: {} });
    const res = mockRes();

    await userController.signUpUserReg(req, res, mockNext);

    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.BAD_REQUEST, 'Email and password are required.');
  });

  it('handles Supabase error', async () => {
    const req = mockReq({ body: { email: 'a@b.com', password: 'pw' } });
    const res = mockRes();

    (SUPABASE.auth.signUp as jest.Mock).mockResolvedValueOnce({ data: null, error: new Error('signup failed') });

    await userController.signUpUserReg(req, res, mockNext);
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'Failed to sign up user.', expect.any(Error));
  });

  it('returns success with data', async () => {
    const req = mockReq({ body: { email: 'a@b.com', password: 'pw' } });
    const res = mockRes();

    (SUPABASE.auth.signUp as jest.Mock).mockResolvedValueOnce({ data: { user: { id: '1' } }, error: null });

    await userController.signUpUserReg(req, res, mockNext);
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.SUCCESS, 'User signed up successfully.', { user: { id: '1' } });
  });
});

describe('OAuth provider helpers', () => {
  it('Google delegates to thirdPartySignInOrSignUp', async () => {
    const req = mockReq();
    const res = mockRes();

    await userController.signUpOrSignInWithGoogle(req, res, mockNext);
    expect(thirdPartySignInOrSignUp).toHaveBeenCalledWith(req, res, PROVIDERS.GOOGLE);
  });

  it('GitHub delegates to thirdPartySignInOrSignUp', async () => {
    const req = mockReq();
    const res = mockRes();

    await userController.signUpUserViaGitHub(req, res, mockNext);
    expect(thirdPartySignInOrSignUp).toHaveBeenCalledWith(req, res, PROVIDERS.GITHUB);
  });
});

describe('getUserInformation', () => {
  it('rejects when req.user missing', () => {
    const req = mockReq();
    const res = mockRes();

    userController.getUserInformation(req, res);
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.UNAUTHORIZED, 'User not authenticated.');
  });

  it('returns user when present', () => {
    const user = { id: 'u1', email: 'e@test.com' };
    const req = mockReq({ user } as any);
    const res = mockRes();

    userController.getUserInformation(req, res);
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.SUCCESS, 'User fetched successfully.', user);
  });
});

describe('deActivateUser', () => {
  it('handles select error', async () => {
    const req = mockReq({ body: { email: 'e@test.com' } });
    const res = mockRes();

    mockSelectEq('user_calendar_tokens', { data: null, error: new Error('select failed') });

    await userController.deActivateUser(req, res, mockNext);
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'Failed to find user.', expect.any(Error));
  });

  it('updates user_telegram_links=false when user exists', async () => {
    const req = mockReq({ body: { email: 'e@test.com' } });
    const res = mockRes();

    mockSelectEq('user_calendar_tokens', { data: [{ email: 'e@test.com' }], error: null });
    mockUpdateEq('user_calendar_tokens', { error: null });

    await userController.deActivateUser(req, res, mockNext);
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.SUCCESS, 'User deactivated successfully.');
  });

  it('handles update error', async () => {
    const req = mockReq({ body: { email: 'e@test.com' } });
    const res = mockRes();

    mockSelectEq('user_calendar_tokens', { data: [{ email: 'e@test.com' }], error: null });
    mockUpdateEq('user_calendar_tokens', { error: new Error('update failed') });

    await userController.deActivateUser(req, res, mockNext);
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'Failed to deactivate user.', expect.any(Error));
  });

  it('no-op when user not found', async () => {
    const req = mockReq({ body: { email: 'none@test.com' } });
    const res = mockRes();

    mockSelectEq('user_calendar_tokens', { data: [], error: null });

    await userController.deActivateUser(req, res, mockNext);
    expect(sendR).not.toHaveBeenCalled();
  });
});

describe('signInUserReg', () => {
  it('validates required body (controller does not return early)', async () => {
    (SUPABASE.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ data: null, error: null });

    const req = mockReq({ body: {} });
    const res = mockRes();

    await userController.signInUserReg(req, res, mockNext);
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.BAD_REQUEST, 'Email and password are required ');
  });

  it('handles Supabase error then sends success per controller flow', async () => {
    const req = mockReq({ body: { email: 'e@test.com', password: 'pw' } });
    const res = mockRes();

    (SUPABASE.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ data: null, error: new Error('bad creds') });

    await userController.signInUserReg(req, res, mockNext);

    expect((sendR as jest.Mock).mock.calls[0][1]).toBe(STATUS_RESPONSE.INTERNAL_SERVER_ERROR);
    expect((sendR as jest.Mock).mock.calls[1][1]).toBe(STATUS_RESPONSE.SUCCESS);
  });

  it('success path', async () => {
    const req = mockReq({ body: { email: 'e@test.com', password: 'pw' } });
    const res = mockRes();

    (SUPABASE.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ data: { session: { access_token: 't' } }, error: null });

    await userController.signInUserReg(req, res, mockNext);
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.SUCCESS, 'User signin successfully.', { session: { access_token: 't' } });
  });
});

describe('verifyEmailByOpt', () => {
  it('validates required body (controller does not return early)', async () => {
    (SUPABASE.auth.verifyOtp as jest.Mock).mockResolvedValueOnce({ data: null, error: null });

    const req = mockReq({ body: {} });
    const res = mockRes();

    await userController.verifyEmailByOpt(req, res, mockNext);
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.BAD_REQUEST, 'Email and token are required.');
  });

  it('handles Supabase verify error then success per controller flow', async () => {
    const req = mockReq({ body: { email: 'e@test.com', token: '123456' } });
    const res = mockRes();

    (SUPABASE.auth.verifyOtp as jest.Mock).mockResolvedValueOnce({ data: null, error: new Error('invalid token') });

    await userController.verifyEmailByOpt(req, res, mockNext);

    expect((sendR as jest.Mock).mock.calls[0][1]).toBe(STATUS_RESPONSE.INTERNAL_SERVER_ERROR);
    expect((sendR as jest.Mock).mock.calls[1][1]).toBe(STATUS_RESPONSE.SUCCESS);
  });

  it('success path', async () => {
    const req = mockReq({ body: { email: 'e@test.com', token: '123456' } });
    const res = mockRes();

    (SUPABASE.auth.verifyOtp as jest.Mock).mockResolvedValueOnce({ data: { user: { id: '1' } }, error: null });

    await userController.verifyEmailByOpt(req, res, mockNext);
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.SUCCESS, 'Email verified successfully.', { user: { id: '1' } });
  });
});
