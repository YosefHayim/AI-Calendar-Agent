import { Response } from "express";

const errorFn = (message: string, status: number, res?: Response): void => {
  const error = new Error(message, { cause: { status } });

  if (res) {
    res?.status(status).json({
      status: "error",
      code: status,
      message: error.message,
    });
  }

  throw Error(message, { cause: { status } });
};

export default errorFn;
