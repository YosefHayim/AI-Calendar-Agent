import { NextFunction, Request, Response } from "express";

export const reqResAsyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next)
      .catch(next)
      .catch((error) => {
        console.error(`reqResAsync error found: ${error}`);
      });
  };
};

export const asyncHandler = (fn: (...args: any[]) => Promise<any>) => {
  return (...args: any[]) => {
    return fn(...args).catch((error) => {
      console.error(`AsyncHandler error found: ${error}`);
    });
  };
};
