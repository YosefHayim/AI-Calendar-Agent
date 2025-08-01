import { Request, Response } from "express";

import { STATUS_CODES } from "../types";
import { SUPABASE } from "../config/root-config";
import { asyncHandler } from "../utils/async-handler";

export const authHandler = asyncHandler(async (req: Request, res: Response) => {
  const {
    data: { user },
  } = await SUPABASE.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
  }
  res.status(STATUS_CODES.UNAUTHORIZED).send("User is not authorized to access this route.");
});
