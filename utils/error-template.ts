import type { Response } from "express";

const errorTemplate = (
	message: string,
	status: number,
	res?: Response,
): void => {
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

export default errorTemplate;
