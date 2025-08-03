import { Request, Response } from "express";

import { asyncHandler } from "@/utils/async-handler";

const getTelegramUserById = asyncHandler(async (req: Request, res: Response) => {});

const createTelegramUser = asyncHandler(async (req: Request, res: Response) => {});

const deleteTelegramUserById = asyncHandler(async (req: Request, res: Response) => {});

const updateTelegramUserByIdd = asyncHandler(async (req: Request, res: Response) => {});

export const telegramUserController = {
  getTelegramUserById,
  createTelegramUser,
  deleteTelegramUserById,
  updateTelegramUserByIdd,
};
