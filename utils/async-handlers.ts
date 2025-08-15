import type { NextFunction, Request, Response } from "express";

export const reqResAsyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next).catch(Error);
  };
};

export const asyncHandler = (fn: (...args: unknown[]) => Promise<unknown>) => {
  return (...args: unknown[]) => {
    return fn(...args).catch(Error);
  };
};
