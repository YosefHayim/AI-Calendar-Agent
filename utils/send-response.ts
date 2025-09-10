import type { Response } from "express";

const ERROR = 400;

const sendR = (res: Response, status: number, message: string, data?: unknown) => {
  res.status(status).json({
    status: status >= ERROR ? "error" : "success",
    message,
    data,
  });
};

export default sendR;
