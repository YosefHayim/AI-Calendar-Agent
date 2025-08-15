import type { Request } from "express";
import { asyncHandler } from "@/utils/async-handlers";

const getConversationById = asyncHandler(
	async (_req: Request, _res: Response) => {},
);

const updateConversationById = asyncHandler(
	async (_req: Request, _res: Response) => {},
);

const deleteConversationById = asyncHandler(
	async (_req: Request, _res: Response) => {},
);

const createConversationBy = asyncHandler(
	async (_req: Request, _res: Response) => {},
);

export const conversationController = {
	getConversationById,
	updateConversationById,
	deleteConversationById,
	createConversationBy,
};
