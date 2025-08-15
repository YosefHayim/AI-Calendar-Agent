// async-handlers.ts
import type { NextFunction, Request, Response } from 'express';

export const reqResAsyncHandler =
  <H extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(fn: H) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

export const asyncHandler =
  <A extends unknown[], R>(fn: (...args: A) => R | Promise<R>) =>
  (...args: A): Promise<R> =>
    Promise.resolve(fn(...args)).catch((err) => {
      throw err;
    });
