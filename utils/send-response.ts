import type { Response } from 'express';

const sendR = (
  res: Response,
  status: number,
  message: string,
  data?: unknown
) => {
  res.status(status).json({
    status: status >= 400 ? 'error' : 'success',
    message,
    data,
  });
};

export default sendR;
