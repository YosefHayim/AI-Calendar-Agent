import { Response } from "express";
import { STATUS_CODES } from "../types";

const sendR = (res: Response) => {
  return (status: STATUS_CODES, message: string, data?: unknown) => {
    res.status(status).json({
      status: status >= 400 ? "error" : "success",
      code: status,
      message,
      data,
    });
  };
};

export default sendR;
