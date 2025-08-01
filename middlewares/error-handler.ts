import { Request, Response } from "express";

import { STATUS_CODES } from "../types";

const errorHandler = (err: any, req: Request, res: Response) => {
  console.error(err.stack);
  const status = err.status || STATUS_CODES.INTERNAL_SERVER_ERROR;
  res.status(status).json({ error: err.message || "Internal Server Error" });
};

export default errorHandler;
