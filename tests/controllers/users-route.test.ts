import { describe, it, beforeEach, expect, jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';

const makeRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    send: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response & { status: jest.Mock; json: jest.Mock; send: jest.Mock; redirect: jest.Mock };
  (res.status as jest.Mock).mockReturnValue(res);
  (res.json as jest.Mock).mockReturnValue(res);
  (res.send as jest.Mock).mockReturnValue(res);
  return res;
};

const makeReq = (over: Partial<Request & { user?: any }> = {}) =>
  ({
    headers: { 'user-agent': 'Mozilla' },
    query: {},
    body: {},
    ...over,
  } as unknown as Request & { user?: any });

const makeNext = () => jest.fn() as unknown as NextFunction;


const sendR = jest.fn();
jest.mock('@/utils/send-response', () => ({
  __esModule: true,
  default: (...args: any[]) => (sendR as any)(...args),
}));

const thirdPartySignInOrSignUp = jest.fn();
jest.mock('@/utils/third-party-signup-signin-supabase', () => ({
  thirdPartySignInOrSignUp: (...args: any[]) => (thirdPartySignInOrSignUp as any)(...args),
}));

jest.mock('@/utils/async-handlers', () => ({
  reqResAsyncHandler:
    (fn: any) =>
    async (req: any, res: any) =>
      fn(req, res),
}));

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: { sign: jest.fn(), verify: jest.fn() },
  decode: (token: string) => ({ email: 'decoded@example.com', sub: '123', token }),
}));

const generateAuthUrl = jest.fn();
const getToken = jest.fn();
const from = jest.fn();
const update = jest.fn();
const eq = jest.fn();
const select = jest.fn();
const signUp = jest.fn();
const signInWithPassword = jest.fn();
const verifyOtp = jest.fn();

jest.mock('@/config/root-config', () => ({
  CONFIG: { redirect_url_dev: 'http://dev/callback' },
  SCOPES: ['openid', 'email', 'profile'],
  OAUTH2CLIENT: { generateAuthUrl: (...a: any[]) => generateAuthUrl(...a), getToken: (...a: any[]) => getToken(...a) },
  SUPABASE: {
    from: (...a: any[]) => from(...a),
    auth: {
      signUp: (...a: any[]) => signUp(...a),
      signInWithPassword: (...a: any[]) => signInWithPassword(...a),
      verifyOtp: (...a: any[]) => verifyOtp(...a),
    },
  },
}));

jest.mock('@/types', () => ({
  STATUS_RESPONSE: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
  PROVIDERS: { GOOGLE: 'google', GITHUB: 'github' },
}));

// Chain for SUPABASE.from(...).update(...).eq(...).select()
beforeEach(() => {
  jest.clearAllMocks();

  from.mockReturnValue({ update, select, eq });
  update.mockReturnValue({ eq, select });
  eq.mockReturnValue({ select });
});

import { userController } from '@/controllers/users-controller'; 

describe('userController.generateAuthGoogleUrl', () => {
  it('redirects to consent screen when no code and non-Postman UA', async () => {
    generateAuthUrl.mockReturnValue('http://auth/url');
    const req = makeReq(); // default UA
    const res = makeRes();

    await userController.generateAuthGoogleUrl(req as any, res as any,makeNext,makeNext);

    expect(generateAuthUrl).toHaveBeenCalledWith({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'consent',
      include_granted_scopes: true,
      redirect_uri: 'http://dev/callback',
    });
    expect(res.redirect).toHaveBeenCalledWith('http://auth/url');
    expect(sendR).not.toHaveBeenCalled();
  });

  it('returns URL via sendR when UA contains Postman', async () => {
    generateAuthUrl.mockReturnValue('http://auth/url');
    const req = makeReq({ headers: { 'user-agent': 'PostmanRuntime/7.39.0' } });
    const res = makeRes();

    await userController.generateAuthGoogleUrl(req as any, res as any,makeNext);

    expect(sendR).toHaveBeenCalledWith(res, 200, 'http://auth/url');
  });

  it('exchanges code for tokens and updates Supabase row', async () => {
    generateAuthUrl.mockReturnValue('http://auth/url');
    getToken.mockResolvedValue({
      tokens: {
        id_token: 'idtok',
        refresh_token: 'reftok',
        refresh_token_expires_in: 3600,
        expiry_date: 1111,
        access_token: 'acctok',
        token_type: 'Bearer',
        scope: 'openid email profile',
      },
    });
    select.mockResolvedValue({ data: [{ ok: true }], error: null });

    const req = makeReq({ query: { code: 'abc' } });
    const res = makeRes();

    await userController.generateAuthGoogleUrl(req as any, res as any,makeNext);

    expect(from).toHaveBeenCalledWith('calendars_of_users');
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'decoded@example.com',
        access_token: 'acctok',
        id_token: 'idtok',
        refresh_token: 'reftok',
        refresh_token_expires_in: 3600,
        expiry_date: 1111,
        token_type: 'Bearer',
        scope: 'openid email profile',
        created_at: expect.any(String),
      })
    );
    expect(eq).toHaveBeenCalledWith('email', 'decoded@example.com');
    expect(sendR).toHaveBeenCalledWith(
      res,
      200,
      'Tokens has been updated successfully.',
      expect.objectContaining({ data: [{ ok: true }] })
    );
  });

  it('handles Supabase update error', async () => {
    getToken.mockResolvedValue({ tokens: { id_token: 'x' } });
    select.mockResolvedValue({ data: null, error: { message: 'db down' } });

    const req = makeReq({ query: { code: 'abc' } });
    const res = makeRes();

    await userController.generateAuthGoogleUrl(req as any, res as any,makeNext);

    expect(sendR).toHaveBeenCalledWith(res, 500, 'Failed to store new tokens.', { message: 'db down' });
  });

  it('handles token exchange exception', async () => {
    getToken.mockRejectedValue(new Error('oauth fail'));
    const req = makeReq({ query: { code: 'abc' } });
    const res = makeRes();

    await userController.generateAuthGoogleUrl(req as any, res as any,makeNext);

    expect(sendR).toHaveBeenCalledWith(res, 500, 'Failed to process OAuth token exchange.', expect.any(Error));
  });
});

describe('userController.signUpUserReg', () => {
  it('400 when email/password missing', async () => {
    const req = makeReq({ body: {} });
    const res = makeRes();
    await userController.signUpUserReg(req as any, res as any,makeNext);
    expect(sendR).toHaveBeenCalledWith(res, 400, 'Email and password are required.');
  });

  it('500 when supabase returns error', async () => {
    signUp.mockResolvedValue({ data: null, error: { message: 'bad' } });
    const req = makeReq({ body: { email: 'a@b.com', password: 'p' } });
    const res = makeRes();
    await userController.signUpUserReg(req as any, res as any,makeNext);
    expect(sendR).toHaveBeenCalledWith(res, 500, 'Failed to sign up user.', { message: 'bad' });
  });

  it('200 when supabase returns data', async () => {
    signUp.mockResolvedValue({ data: { user: { id: '1' } }, error: null });
    const req = makeReq({ body: { email: 'a@b.com', password: 'p' } });
    const res = makeRes();
    await userController.signUpUserReg(req as any, res as any,makeNext);
    expect(sendR).toHaveBeenCalledWith(res, 200, 'User signed up successfully.', { user: { id: '1' } });
  });
});

describe('userController.signUpOrSignInWithGoogle / signUpUserViaGitHub', () => {
  it('delegates to thirdPartySignInOrSignUp with GOOGLE', async () => {
    const req = makeReq();
    const res = makeRes();
    await userController.signUpOrSignInWithGoogle(req as any, res as any,makeNext);
    expect(thirdPartySignInOrSignUp).toHaveBeenCalledWith(req, res, 'google');
  });

  it('delegates to thirdPartySignInOrSignUp with GITHUB', async () => {
    const req = makeReq();
    const res = makeRes();
    await userController.signUpUserViaGitHub(req as any, res as any,makeNext);
    expect(thirdPartySignInOrSignUp).toHaveBeenCalledWith(req, res, 'github');
  });
});

describe('userController.getUserInformation', () => {
  it('401 when user missing', () => {
    const req = makeReq(); // no user
    delete (req as any).user;
    const res = makeRes();
    userController.getUserInformation(req as any, res as any,makeNext);
    expect(sendR).toHaveBeenCalledWith(res, 401, 'User not authenticated.');
  });

  it('200 when user present', () => {
    const req = makeReq({ user: { id: 'u1', email: 'x@y.com' } });
    const res = makeRes();
    userController.getUserInformation(req as any, res as any,makeNext);
    expect(sendR).toHaveBeenCalledWith(res, 200, 'User fetched successfully.', { id: 'u1', email: 'x@y.com' });
  });
});

describe('userController.deActivateUser', () => {
  it('500 when select errors', async () => {
    select.mockResolvedValueOnce({ data: null, error: { message: 'select fail' } });
    const req = makeReq({ body: { email: 'x@y.com' } });
    const res = makeRes();
    await userController.deActivateUser(req as any, res as any,makeNext);
    expect(sendR).toHaveBeenCalledWith(res, 500, 'Failed to find user.', { message: 'select fail' });
  });

  it('success path updates is_active=false', async () => {
    // First select finds rows
    from.mockReturnValueOnce({ select, eq }); // for initial select
    select.mockResolvedValueOnce({ data: [{ email: 'x@y.com' }], error: null });

    // Second from().update().eq() for update path
    const update2 = jest.fn().mockReturnValue({ eq });
    from.mockReturnValueOnce({ update: update2, eq });
    eq.mockResolvedValueOnce({ error: null }); // update result

    const req = makeReq({ body: { email: 'x@y.com' } });
    const res = makeRes();

    await userController.deActivateUser(req as any, res as any,makeNext);

    expect(update2).toHaveBeenCalledWith({ is_active: false });
    expect(sendR).toHaveBeenCalledWith(res, 200, 'User deactivated successfully.');
  });

  it('update error path', async () => {
    from.mockReturnValueOnce({ select, eq });
    select.mockResolvedValueOnce({ data: [{ email: 'x@y.com' }], error: null });

    const update2 = jest.fn().mockReturnValue({ eq });
    from.mockReturnValueOnce({ update: update2, eq });
    eq.mockResolvedValueOnce({ error: { message: 'update fail' } });

    const req = makeReq({ body: { email: 'x@y.com' } });
    const res = makeRes();

    await userController.deActivateUser(req as any, res as any,makeNext);

    expect(sendR).toHaveBeenCalledWith(res, 500, 'Failed to deactivate user.', { message: 'update fail' });
  });
});

describe('userController.signInUserReg', () => {
  it('400 when email/password missing', async () => {
    const req = makeReq({ body: {} });
    const res = makeRes();
    await userController.signInUserReg(req as any, res as any,makeNext);
    expect(sendR).toHaveBeenCalledWith(res, 400, 'Email and password are required ');
  });

  it('500 when signInWithPassword error', async () => {
    signInWithPassword.mockResolvedValue({ data: null, error: { message: 'bad' } });
    const req = makeReq({ body: { email: 'a@b.com', password: 'p' } });
    const res = makeRes();
    await userController.signInUserReg(req as any, res as any,makeNext);
    expect(sendR).toHaveBeenCalledWith(res, 500, 'Failed to fetch user by email.', { message: 'bad' });
  });

  it('200 when signInWithPassword returns data', async () => {
    signInWithPassword.mockResolvedValue({ data: { user: { id: '1' } }, error: null });
    const req = makeReq({ body: { email: 'a@b.com', password: 'p' } });
    const res = makeRes();
    await userController.signInUserReg(req as any, res as any,makeNext);
    expect(sendR).toHaveBeenCalledWith(res, 200, 'User signin successfully.', { user: { id: '1' } });
  });
});

describe('userController.verifyEmailByOpt', () => {
  it('400 when email/token missing', async () => {
    const req = makeReq({ body: {} });
    const res = makeRes();
    await userController.verifyEmailByOpt(req as any, res as any,makeNext);
    expect(sendR).toHaveBeenCalledWith(res, 400, 'Email and token are required.');
  });

  it('500 when verifyOtp error', async () => {
    verifyOtp.mockResolvedValue({ data: null, error: { message: 'bad' } });
    const req = makeReq({ body: { email: 'a@b.com', token: '123456' } });
    const res = makeRes();
    await userController.verifyEmailByOpt(req as any, res as any,makeNext);
    expect(sendR).toHaveBeenCalledWith(res, 500, 'Failed to verify email.', { message: 'bad' });
  });

  it('200 when verifyOtp returns data', async () => {
    verifyOtp.mockResolvedValue({ data: { ok: true }, error: null });
    const req = makeReq({ body: { email: 'a@b.com', token: '123456' } });
    const res = makeRes();
    await userController.verifyEmailByOpt(req as any, res as any,makeNext);
    expect(sendR).toHaveBeenCalledWith(res, 200, 'Email verified successfully.', { ok: true });
  });
});
