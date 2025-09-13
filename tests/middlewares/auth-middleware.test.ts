import { describe, it, beforeEach, expect, jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

const makeRes = (): Response & { status: jest.Mock; json: jest.Mock } => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  } as any;
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
};

const makeReq = (over: Partial<Request> = {}): Request =>
  ({
    headers: {},
    ...over,
  } as any);

const sendR = jest.fn();
jest.mock('@/utils/send-response', () => ({
  __esModule: true,
  default: (...args: any[]) => (sendR as any)(...args),
}));

jest.mock('@/utils/async-handlers', () => ({
  asyncHandler:
    (fn: any) =>
    async (req: any, res: any, next: any) =>
      fn(req, res, next),
}));

const getUser = jest.fn();
jest.mock('@/config/root-config', () => ({
  SUPABASE: {
    auth: {
      getUser: (...a: any[]) => getUser(...a),
    },
  },
}));

jest.mock('@/types', () => ({
  STATUS_RESPONSE: {
    UNAUTHORIZED: 401,
  },
}));

import { STATUS_RESPONSE } from '@/types';
import { authHandler } from '@/middlewares/auth-handler';

describe('authHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when Authorization header is missing', async () => {
    const req = makeReq(); 
    const res = makeRes();
    const next = jest.fn();

    await authHandler(req, res, next);

    expect(sendR).toHaveBeenCalledWith(
      res,
      STATUS_RESPONSE.UNAUTHORIZED,
      'Missing authorization in headers: ',
      undefined
    );
    expect(getUser).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Supabase returns no user', async () => {
    const req = makeReq({ headers: { authorization: 'Bearer token-123' } });
    const res = makeRes();
    const next = jest.fn();

    getUser.mockResolvedValueOnce({ data: { user: null } });

    await authHandler(req, res, next);

    expect(getUser).toHaveBeenCalledWith('token-123');
    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.UNAUTHORIZED, 'User is not authenticated.');
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches user to req and calls next when authenticated', async () => {
    const req = makeReq({ headers: { authorization: 'Bearer token-abc' } });
    const res = makeRes();
    const next = jest.fn();
    const user = { id: 'u1', email: 'x@y.com' };

    getUser.mockResolvedValueOnce({ data: { user } });

    await authHandler(req, res, next);

    expect(getUser).toHaveBeenCalledWith('token-abc');
    expect((req as any).user).toEqual(user);
    expect(sendR).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
