import { describe, expect, it, jest } from '@jest/globals';
import type { Response } from 'express';
import errorTemplate from '@/utils/error-template';

const makeRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  } as Partial<Response> as Response;

  (res.status as jest.Mock).mockReturnValue(res);
  (res.json as jest.Mock).mockReturnValue(res);

  return res;
};

const getCauseStatus = (err: unknown) => (err as any)?.cause?.status;

describe('errorTemplate', () => {
  it('sets status/json on Response and throws', () => {
    const res = makeRes();
    const message = 'Bad thing';
    const httpStatus = 400;

    // Assert throw without manual try/catch for message/type
    expect(() => errorTemplate(message, httpStatus, res)).toThrowError(message);

    // Boundary effects
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(httpStatus);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      code: httpStatus,
      message,
    });

    // Cause-specific assertion (requires catch to inspect object)
    try {
      errorTemplate(message, httpStatus, res);
    } catch (e) {
      expect(getCauseStatus(e)).toBe(httpStatus);
    }
  });

  it('throws without touching Response when none is provided', () => {
    const message = 'No response';
    const httpStatus = 500;

    expect(() => errorTemplate(message, httpStatus)).toThrowError(message);

    try {
      errorTemplate(message, httpStatus);
    } catch (e) {
      expect(getCauseStatus(e)).toBe(httpStatus);
    }
  });

  it('propagates exact message text', () => {
    const customMsg = 'precise-message';
    expect(() => errorTemplate(customMsg, 418)).toThrowError(customMsg);
  });
});
