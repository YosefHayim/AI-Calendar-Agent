import { Request, Response } from "express";

import { asyncHandler } from "../utils/async-handler";

const getTelegramBotById = asyncHandler(async (req: Request, res: Response) => {});

const createTelegramBot = asyncHandler(async (req: Request, res: Response) => {});

const deleteTelegramBotById = asyncHandler(async (req: Request, res: Response) => {});

const updateTelegramBotById = asyncHandler(async (req: Request, res: Response) => {});

export const telegramBotController = {
  getTelegramBotById,
  createTelegramBot,
  deleteTelegramBotById,
  updateTelegramBotById,
};
