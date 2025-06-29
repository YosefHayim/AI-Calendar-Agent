import { Request, Response } from 'express';

const errorHandler = (err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
};

export default errorHandler;
