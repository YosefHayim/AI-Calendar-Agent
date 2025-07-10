import { NextFunction, Request, Response } from "express";

export const reqResAsyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const asyncHandler = (fn: (...args: any[]) => Promise<any>) => {
  return (...args: any[]) => {
    return fn(...args).catch((error) => {
      console.error(`Error found: ${error}`);
      throw error;
    });
  };
};
