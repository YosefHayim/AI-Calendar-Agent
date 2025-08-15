import type { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/types";
import sendR from "@/utils/send-response";

const errorHandler = (
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	const status = err.status || STATUS_RESPONSE.INTERNAL_SERVER_ERROR;
	sendR(res, status, err.message || "Internal Server Error");
};

export default errorHandler;
