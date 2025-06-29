import { Response } from 'express';

const sendR = (res: Response) => {
  return (status: number, message: string, data?: unknown) => {
    res.status(status).json({
      status: status >= 400 ? 'error' : 'success',
      code: status,
      message,
      data,
    });
  };
};

export default sendR;
