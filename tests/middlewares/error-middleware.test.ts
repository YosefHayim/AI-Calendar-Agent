// error-handler.test.ts
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

// ---- Mocks ----
const sendR = jest.fn();
jest.mock('@/utils/send-response', () => ({
  __esModule: true,
  default: (...args: any[]) => (sendR as any)(...args),
}));

jest.mock('@/types', () => ({
  STATUS_RESPONSE: {
    INTERNAL_SERVER_ERROR: 500,
    BAD_REQUEST: 400,
  },
}));

import errorHandler from '@/middlewares/error-handler';
import { STATUS_RESPONSE } from '@/types';

describe('errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses INTERNAL_SERVER_ERROR when no status is on the error', () => {
    const err = new Error('boom');
    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'boom');
  });

  it('uses custom status when present on error', () => {
    const err = new Error('bad input') as Error & { status?: number };
    err.status = STATUS_RESPONSE.BAD_REQUEST;

    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.BAD_REQUEST, 'bad input');
  });

  it('falls back to default message when error.message is empty', () => {
    const err = new Error('') as Error;
    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(sendR).toHaveBeenCalledWith(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  });
});
