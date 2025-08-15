import type { Request } from 'express';
import { asyncHandler } from '@/utils/async-handlers';

const getConversationById = asyncHandler(
  async (req: Request, res: Response) => {}
);

const updateConversationById = asyncHandler(
  async (req: Request, res: Response) => {}
);

const deleteConversationById = asyncHandler(
  async (req: Request, res: Response) => {}
);

const createConversationBy = asyncHandler(
  async (req: Request, res: Response) => {}
);

export const conversationController = {
  getConversationById,
  updateConversationById,
  deleteConversationById,
  createConversationBy,
};
