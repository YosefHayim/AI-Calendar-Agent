import { Response } from "express";
import { STATUS_RESPONSE } from "../types";

const sendR = (res: Response) => {
  return (status: number, message: string, data?: unknown) => {
    res.status(status).json({
      status: status >= 400 ? "error" : "success",
      code: STATUS_RESPONSE[status],
      message,
      data,
    });
  };
};

export default sendR;
